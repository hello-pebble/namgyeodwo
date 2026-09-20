"use client";

import type { RecordEntry } from "@/lib/types";

function formatWhen(value: string) {
  if (!value || value === "미상") return { date: "날짜 미상", detail: "일시 미상" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: value, detail: value };
  return {
    date: date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }),
    detail: date.toLocaleString("ko-KR", { year: "numeric", month: "long", day: "numeric", ...(value.includes("T") ? { hour: "2-digit", minute: "2-digit" } : {}) }),
  };
}

const KNOWN = (value: string) => value && !["미상", "기억 안 남", "없음"].includes(value);

interface Props {
  records: RecordEntry[];
  onDelete: (id: string) => void;
}

export default function Timeline({ records, onDelete }: Props) {
  if (records.length === 0) {
    return <div className="empty-records"><span className="empty-records-icon" aria-hidden="true">✎</span><h3>아직 남겨둔 기록이 없어요</h3><p>위에서 오늘의 일을 한 줄로 남겨보세요. 첫 기록부터 차곡차곡 모아둘게요.</p></div>;
  }

  const sorted = records.slice().sort((a, b) => (b.when || b.createdAt).localeCompare(a.when || a.createdAt));

  return (
    <ol className="timeline-list">
      {sorted.map((record) => {
        const when = formatWhen(record.when);
        return <li className="timeline-item" key={record.id}>
          <div className="timeline-date">{when.date}</div>
          <article className="timeline-card">
            <div className="timeline-card-top"><span>{when.detail}{KNOWN(record.where) ? ` · ${record.where}` : ""}</span><span className="category-pill">{record.category}</span></div>
            <h3>{record.summary}</h3>
            {KNOWN(record.quote) && <blockquote>“{record.quote}”</blockquote>}
            <div className="timeline-meta">
              {KNOWN(record.who) && <span>관련자 {record.who}</span>}
              {KNOWN(record.witnesses) && <span>함께한 사람 {record.witnesses}</span>}
              {record.attachments.length > 0 && <span>자료 이름 {record.attachments.join(", ")}</span>}
            </div>
            <div className="timeline-bottom"><span>기록한 시각 {new Date(record.createdAt).toLocaleString("ko-KR")}</span><button type="button" onClick={() => onDelete(record.id)} aria-label={`${record.summary} 삭제`}>삭제</button></div>
          </article>
        </li>;
      })}
    </ol>
  );
}
