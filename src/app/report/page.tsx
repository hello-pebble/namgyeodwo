"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadRecords } from "@/lib/storage";
import type { PatternReport, RecordEntry } from "@/lib/types";

export default function ReportPage() {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [report, setReport] = useState<PatternReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setRecords(loadRecords()); setReady(true); }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ records }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "리포트를 만들지 못했습니다.");
      setReport(data as PatternReport);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "리포트를 만들지 못했습니다. 다시 시도해 주세요.");
    } finally { setLoading(false); }
  }

  return <div className="content-page">
    <p className="page-kicker">남겨둔 기록을 한눈에</p>
    <h1 className="page-title">기록 리포트</h1>
    <p className="page-description">여러 기록 사이의 흐름을 살펴보고, 필요할 때 공유할 수 있는 정리 문서를 만듭니다. AI가 정리한 내용은 원래 기록과 비교해 확인해 주세요.</p>

    {ready && records.length === 0 && <section className="content-card"><h2>먼저 기록을 남겨주세요</h2><p>한 건만 있어도 내용을 정리한 문서를 만들 수 있어요.</p><Link href="/" className="outline-action">기록하러 가기 <span aria-hidden="true">↗</span></Link></section>}

    {ready && records.length > 0 && !report && <section className="content-card no-print">
      <h2>모아둔 기록 {records.length}건</h2>
      <p>기록의 변화와 반복을 찾아보고, 빠진 정보와 정리 문서를 제안합니다. 리포트는 지금 저장된 기록을 바탕으로 만들어집니다.</p>
      {records.length < 2 && <p className="report-warning">기록이 한 건이라 반복되는 흐름은 찾기 어렵지만, 정리 문서는 만들 수 있어요.</p>}
      <button type="button" className="primary-action" onClick={generate} disabled={loading}>{loading ? "리포트 만드는 중…" : "리포트 만들기"}<span aria-hidden="true">↗</span></button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>}

    {report && <>
      <div className="report-actions no-print"><button type="button" className="quiet-action" onClick={() => setReport(null)}>다시 만들기</button><button type="button" className="primary-action" onClick={() => window.print()}>PDF로 저장 / 인쇄 <span aria-hidden="true">↗</span></button></div>
      <article className="report-document">
        <header><h1>{report.title}</h1><p>{report.period} · 총 {report.count}건 · {report.categories.join(", ")}</p><p>생성 {new Date().toLocaleString("ko-KR")} · 남겨둬</p></header>
        <ReportSection title="기록에서 보이는 흐름"><ul>{report.patterns.map((item) => <li key={item}>{item}</li>)}</ul></ReportSection>
        {report.legalNotes.length > 0 && <ReportSection title="참고할 수 있는 제도"><ul>{report.legalNotes.map((item) => <li key={item}>{item}</li>)}</ul></ReportSection>}
        <ReportSection title="더 남겨두면 좋은 정보"><ol>{report.nextEvidence.map((item) => <li key={item}>{item}</li>)}</ol></ReportSection>
        <ReportSection title="기록 정리 문서"><pre>{report.draft}</pre></ReportSection>
        <p className="report-disclaimer">{report.disclaimer}</p>
      </article>
    </>}
  </div>;
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2>{title}</h2>{children}</section>;
}
