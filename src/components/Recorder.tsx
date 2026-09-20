"use client";

import { useRef, useState } from "react";
import type { RecordEntry, StructuredRecord } from "@/lib/types";

const FIELD_LABEL: Record<string, string> = {
  when: "일시",
  where: "장소",
  who: "관련자",
  what: "무슨 일",
  quote: "발언·행위 원문",
  witnesses: "목격자",
  evidence: "증거",
};

const EXAMPLES = [
  "회의에서 다음 주 금요일까지 초안을 보내기로 했다",
  "집주인이 보일러 수리비는 본인이 부담하겠다고 했다",
  "민수에게 20만 원을 빌려주고 월급날 받기로 했다",
  "의사가 약은 아침 공복에 먹고 2주 뒤 다시 오라고 했다",
];
const EXAMPLE_LABELS = ["업무", "생활", "약속", "건강"];

/** 브라우저 로컬 시각을 오프셋 포함 ISO로 (예: 2026-09-20T15:28+09:00) */
function localNow() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** 일시 칸에 "오늘", "어제 3시" 같은 표현을 직접 쓰면 날짜로 바꿔줌 */
function normalizeWhen(v: string): string {
  const t = v.trim();
  const rel: Record<string, number> = { 오늘: 0, 어제: -1, 그제: -2, 그저께: -2, 엊그제: -2 };
  const m = t.match(/^(오늘|어제|그제|그저께|엊그제)\s*(?:(오전|오후)?\s*(\d{1,2})\s*시\s*(\d{1,2})?\s*분?)?$/);
  if (!m) return v;
  const d = new Date();
  d.setDate(d.getDate() + rel[m[1]]);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (!m[3]) return date;
  let h = parseInt(m[3], 10);
  if (m[2] === "오후" && h < 12) h += 12;
  if (m[2] === "오전" && h === 12) h = 0;
  return `${date}T${pad(h)}:${pad(m[4] ? parseInt(m[4], 10) : 0)}`;
}

interface Props {
  onSave: (entry: RecordEntry) => void;
}

export default function Recorder({ onSave }: Props) {
  const [raw, setRaw] = useState("");
  const [answers, setAnswers] = useState("");
  const [structured, setStructured] = useState<StructuredRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function structure(withAnswers: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw,
          previous: withAnswers ? structured : undefined,
          answers: withAnswers ? answers : undefined,
          now: localNow(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "실패");
      setStructured(data as StructuredRecord);
      setAnswers("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function editField(k: keyof StructuredRecord, value: string) {
    if (!structured) return;
    const filled = value.trim().length > 0;
    setStructured({
      ...structured,
      [k]: filled ? value : "미상",
      missing: filled
        ? structured.missing.filter((m) => m !== k)
        : structured.missing.includes(k as (typeof structured.missing)[number])
          ? structured.missing
          : [...structured.missing, k as (typeof structured.missing)[number]],
    });
  }

  async function save() {
    if (!structured || structured.missing.length > 0) return;
    setLoading(true);
    setError(null);
    let final: StructuredRecord = structured;
    try {
      const res = await fetch("/api/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw, previous: structured, finalize: true, now: localNow() }),
      });
      const data = await res.json();
      if (res.ok) final = { ...(data as StructuredRecord), missing: [], questions: [] };
      // 교정 실패(서버 붐빔 등)여도 사용자가 확인한 내용 그대로 저장
    } catch {
      /* 교정 생략 */
    } finally {
      setLoading(false);
    }
    const entry: RecordEntry = {
      ...final,
      id: crypto.randomUUID(),
      raw,
      createdAt: new Date().toISOString(),
      attachments: files,
    };
    onSave(entry);
    setRaw("");
    setStructured(null);
    setAnswers("");
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function reset() {
    setStructured(null);
    setAnswers("");
    setError(null);
  }

  const canSave = structured !== null && structured.missing.length === 0;

  return (
    <section className="record-card" aria-label="새 기록 남기기">
      {!structured ? (
        <>
          <div className="record-card-heading"><div><h2>새 기록 남기기</h2><p>지금 떠오르는 내용을 편하게 적어보세요.</p></div><span className="card-symbol" aria-hidden="true">✎</span></div>
          <label htmlFor="record-raw" className="record-label">어떤 일이 있었나요?</label>
          <textarea
            id="record-raw"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="예: 오늘 팀 회의에서 금요일까지 기획안을 공유하기로 했어요."
            rows={4}
            className="record-textarea"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && raw.trim()) structure(false);
            }}
          />
          <div className="examples-row"><span className="examples-title">이런 것도 남겨요</span>
            {EXAMPLES.map((ex, index) => (
              <button
                key={ex}
                type="button"
                onClick={() => setRaw(ex)}
                className="example-chip"
                title={ex}
              >
                {EXAMPLE_LABELS[index]}
              </button>
            ))}
          </div>
          <div className="record-footer">
            <div className="file-control">
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
              />
              <button type="button" onClick={() => fileRef.current?.click()}>＋ 자료 이름 남기기</button>
              <span>{files.length > 0 ? `${files.length}개 선택됨 · 파일 이름만 저장돼요` : "파일 자체는 저장되지 않고 이름만 기록돼요"}</span>
            </div>
            <button
              type="button"
              disabled={!raw.trim() || loading}
              onClick={() => structure(false)}
              className="primary-action"
            >
              {loading ? "정리 중…" : "기록 정리하기"}<span aria-hidden="true">↗</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="review-intro"><div><h2>정리한 내용을 확인해 주세요</h2><p>사실과 다른 부분은 바로 고칠 수 있어요.</p></div><span className="category-pill">{structured.category}</span></div>
          <p className="review-summary">{structured.summary}</p>
          <p className="review-help">저장 후에는 수정할 수 없어요. 빈 칸은 직접 채우거나 ‘없음’·‘기억 안 남’을 눌러 확인해 주세요.</p>
          <dl className="review-fields">
            {(["when", "where", "who", "what", "quote", "witnesses", "evidence"] as const).map((k) => {
              const missing = structured.missing?.includes(k);
              return (
                <div key={k} className="review-field">
                  <dt>{FIELD_LABEL[k]}</dt>
                  <dd>
                    <input
                      aria-label={FIELD_LABEL[k]}
                      value={missing && structured[k] === "미상" ? "" : structured[k]}
                      placeholder={missing ? (k === "who" ? "예: 개발2팀 김○○ 팀장 / 안경 쓴 남자 직원" : k === "when" ? "예: 오늘 오후 3시 / 어제 / 2026-09-18" : "미상 — 기억나면 적어주세요") : ""}
                      onChange={(e) => editField(k, e.target.value)}
                      onBlur={(e) => {
                        if (k === "when") {
                          const n = normalizeWhen(e.target.value);
                          if (n !== e.target.value) editField(k, n);
                        }
                      }}
                      className={missing ? "is-missing" : ""}
                    />
                    {missing && (
                      <>
                        <button
                          type="button"
                          onClick={() => editField(k, "없음")}
                          title="해당 사항 없음 (예: 혼자 있었음, 남은 자료 없음)"
                          className="small-choice"
                        >
                          없음
                        </button>
                        <button
                          type="button"
                          onClick={() => editField(k, "기억 안 남")}
                          title="있었지만 기억나지 않음"
                          className="small-choice"
                        >
                          기억 안 남
                        </button>
                      </>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>

          {structured.questions?.length > 0 && (
            <div className="questions-box">
              <strong>기억나면 이것도 남겨주세요</strong>
              <ul>
                {structured.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
              <textarea
                value={answers}
                onChange={(e) => setAnswers(e.target.value)}
                rows={2}
                placeholder="기억나는 대로. 모르면 그냥 저장해도 됩니다."
              />
              <button
                type="button"
                disabled={!answers.trim() || loading}
                onClick={() => structure(true)}
              >
                {loading ? "반영 중…" : "답변 반영"}
              </button>
            </div>
          )}

          <div className="review-actions">
            <button type="button" onClick={reset} className="quiet-action">
              다시 쓰기
            </button>
            <div className="flex items-center gap-3">
              {structured.missing.length > 0 && (
                <span className="missing-count">
                  확인 안 된 칸 {structured.missing.length}개
                </span>
              )}
              <button
                type="button"
                disabled={!canSave || loading}
                onClick={save}
                className="primary-action"
              >
                {loading ? "저장 중…" : "기록 저장하기"}
              </button>
            </div>
          </div>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
