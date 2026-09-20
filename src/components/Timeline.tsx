"use client";

import AppIcon from "./AppIcon";
import RelatedBox from "./RelatedBox";
import type { RecordEntry } from "@/lib/types";

function formatWhen(value: string) {
  if (!value || value === "미상") return "날짜 미상";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

interface Props {
  records: RecordEntry[];
  onDelete: (id: string) => void;
  compact?: boolean;
  filtered?: boolean;
}

export default function Timeline({ records, onDelete, compact = false, filtered = false }: Props) {
  if (records.length === 0) return <div className={`empty-records ${compact ? "compact-empty" : ""}`}><div className="empty-drawing" aria-hidden="true"><AppIcon name={filtered ? "search" : "archive"} width="34" height="34" /><span /></div><h3>{filtered ? "찾는 기록이 없어요" : "첫 기록을 기다리고 있어요"}</h3><p>{filtered ? "다른 단어로 찾거나 분류를 바꿔보세요." : "작은 일부터 하나씩.\n남겨둔 순간이 여기에 모여요."}</p></div>;

  return <ol className={compact ? "timeline-list compact-timeline" : "timeline-list"}>
    {records.map((record) => <li key={record.id}>
      <details className="timeline-card">
        <summary><div className="timeline-card-top"><span className="category-pill">{record.category}</span><span className="record-date">{formatWhen(record.when)}</span></div><div className="record-summary-line"><h3>{record.summary}</h3><AppIcon name="chevron" width="16" height="16" /></div><p className="record-preview">{record.raw}</p></summary>
        <div className="record-details"><dl>{([
          ["일시", record.when], ["장소", record.where], ["관련자", record.who], ["내용", record.what], ["기억할 말", record.quote], ["함께한 사람", record.witnesses], ["남은 자료", record.evidence],
        ] as const).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "미상"}</dd></div>)}</dl>
          <RelatedBox compact items={record.related ?? []} title="이 일에 써먹을 수 있는 배운 것" />
          <div className="original-note"><h4>처음 남긴 글</h4><p>{record.raw}</p></div>
          {record.attachments.length > 0 && <p className="record-attachments"><AppIcon name="attach" width="13" height="13" />자료 이름: {record.attachments.join(", ")}</p>}
          <div className="timeline-bottom"><span>남긴 시각 {new Date(record.createdAt).toLocaleString("ko-KR")}</span><button type="button" onClick={() => onDelete(record.id)} aria-label={`${record.summary} 삭제`}><AppIcon name="trash" width="13" height="13" />삭제</button></div>
        </div>
      </details>
    </li>)}
  </ol>;
}
