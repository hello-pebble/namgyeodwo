"use client";

import AppIcon from "./AppIcon";
import RelatedBox from "./RelatedBox";
import type { StructuredLearning } from "@/lib/types";

interface Props {
  data: StructuredLearning;
  myThought: string;
  answers: string;
  loading: boolean;
  onChange: (next: StructuredLearning) => void;
  onThought: (v: string) => void;
  onAnswers: (v: string) => void;
  onApplyAnswers: () => void;
  onReset: () => void;
  onSave: () => void;
}

export default function LearningReview({ data, myThought, answers, loading, onChange, onThought, onAnswers, onApplyAnswers, onReset, onSave }: Props) {
  const missing = (k: "source" | "claim") => data.missing?.includes(k);

  function setField(k: "title" | "source" | "claim", value: string) {
    const filled = value.trim().length > 0;
    const next: StructuredLearning = { ...data, [k]: filled ? value : "미상" };
    if (k === "source" || k === "claim") {
      next.missing = filled ? data.missing.filter((m) => m !== k) : data.missing.includes(k) ? data.missing : [...data.missing, k];
    }
    onChange(next);
  }

  const canSave = data.missing.length === 0 && data.title.trim().length > 0;

  return <>
    <div className="review-intro"><div><h2>이렇게 정리했어요</h2><p>맞는지 확인하고 배운 것 보관함에 남겨주세요.</p></div><span className="category-pill">{data.topic}</span></div>
    <RelatedBox items={data.related ?? []} title="전에 남긴 배운 것과 연결돼요" />
    <p className="review-help">저장 후에는 수정할 수 없어요. 출처를 모르면 ‘출처 모름’을 눌러 확인해 주세요.</p>
    <dl className="review-fields">
      <div className="review-field"><dt>제목</dt><dd><input disabled={loading} aria-label="제목" value={data.title} onChange={(e) => setField("title", e.target.value)} /></dd></div>
      <div className="review-field"><dt>출처</dt><dd>
        <input disabled={loading} aria-label="출처" value={missing("source") && data.source === "미상" ? "" : data.source} placeholder={missing("source") ? "예: 유튜브 ○○ 채널 / 책 제목 / 링크" : ""} onChange={(e) => setField("source", e.target.value)} className={missing("source") ? "is-missing" : ""} />
        {missing("source") && <button type="button" disabled={loading} className="small-choice" onClick={() => setField("source", "출처 모름")}>출처 모름</button>}
      </dd></div>
      <div className="review-field"><dt>핵심 주장</dt><dd>
        <input disabled={loading} aria-label="핵심 주장" value={missing("claim") && data.claim === "미상" ? "" : data.claim} placeholder={missing("claim") ? "한 문장으로 결론을 적어주세요" : ""} onChange={(e) => setField("claim", e.target.value)} className={missing("claim") ? "is-missing" : ""} />
      </dd></div>
      <div className="review-field"><dt>기억할 것</dt><dd>
        <textarea disabled={loading} aria-label="기억할 포인트 (줄바꿈으로 구분)" className="review-textarea" rows={Math.max(2, data.points.length)} value={data.points.join("\n")} onChange={(e) => onChange({ ...data, points: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} placeholder="한 줄에 하나씩" />
      </dd></div>
      <div className="review-field"><dt>태그</dt><dd>
        <input disabled={loading} aria-label="태그 (쉼표로 구분)" value={data.tags.join(", ")} onChange={(e) => onChange({ ...data, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="쉼표로 구분" />
      </dd></div>
      <div className="review-field"><dt>내 생각</dt><dd>
        <textarea disabled={loading} aria-label="내 생각" className="review-textarea" rows={2} value={myThought} onChange={(e) => onThought(e.target.value)} placeholder="어디에 써먹을지, 동의하는지… (선택)" />
      </dd></div>
    </dl>

    {data.questions?.length > 0 && <div className="questions-box">
      <strong>기억나면 이것도 남겨주세요</strong>
      <ul>{data.questions.map((q) => <li key={q}>{q}</li>)}</ul>
      <textarea aria-label="추가로 기억나는 내용" disabled={loading} value={answers} onChange={(e) => onAnswers(e.target.value)} rows={2} placeholder="기억나는 내용을 더 적어주세요." />
      <button type="button" disabled={!answers.trim() || loading} onClick={onApplyAnswers}>{loading ? "반영 중…" : "답변 반영"}</button>
    </div>}

    <div className="review-actions">
      <button type="button" disabled={loading} onClick={onReset} className="quiet-action">다시 쓰기</button>
      <div className="flex items-center gap-3">
        {data.missing.length > 0 && <span className="missing-count">확인 안 된 칸 {data.missing.length}개</span>}
        <button type="button" disabled={!canSave || loading} onClick={onSave} className="primary-action">{loading ? "저장하는 중…" : "배운 것에 남겨두기"}<AppIcon name="check" width="17" height="17" /></button>
      </div>
    </div>
  </>;
}
