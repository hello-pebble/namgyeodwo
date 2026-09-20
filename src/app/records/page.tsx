"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import AppIcon from "@/components/AppIcon";
import { exportJson, loadRecords, saveRecords } from "@/lib/storage";
import type { RecordEntry } from "@/lib/types";

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [error, setError] = useState("");
  useEffect(() => { setRecords(loadRecords()); setReady(true); }, []);

  const categories = ["전체", ...new Set(records.map((record) => record.category))];
  const query = search.trim().toLocaleLowerCase();
  const filtered = records.filter((record) => (category === "전체" || record.category === category) && [record.summary, record.raw, record.who, record.where, record.what, record.quote, record.category].join(" ").toLocaleLowerCase().includes(query)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function remove(id: string) {
    if (!window.confirm("이 기록을 삭제할까요? 삭제하면 되돌릴 수 없습니다.")) return;
    try {
      const next = records.filter((record) => record.id !== id);
      saveRecords(next);
      setRecords(next);
      if (category !== "전체" && !next.some((record) => record.category === category)) setCategory("전체");
    } catch { setError("삭제하지 못했어요. 브라우저 저장 공간을 확인해 주세요."); }
  }

  return <div className="library-page">
    <div className="page-heading"><div><h1>기록 보관함 <span className="heading-count">{records.length}</span></h1><p>그날의 일, 그때의 말. 여기 다 있어요.</p></div>{records.length > 0 && <button type="button" className="secondary-action" onClick={() => exportJson(records)}><AppIcon name="download" width="16" height="16" />백업하기</button>}</div>
    <div className="library-toolbar"><label className="search-field"><AppIcon name="search" /><input type="search" aria-label="기록 검색" placeholder="내용, 사람, 장소로 찾아보세요" value={search} onChange={(event) => setSearch(event.target.value)} /></label><Link href="/" className="primary-action"><AppIcon name="write" width="16" height="16" />새 기록</Link></div>
    <div className="category-filters" aria-label="기록 분류">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} className={category === item ? "is-selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {ready && <Timeline records={filtered} onDelete={remove} filtered={records.length > 0 || query.length > 0} />}
    <p className="library-footnote"><AppIcon name="lock" width="13" height="13" />이 브라우저에 저장된 기록이에요. 브라우저 데이터를 지우기 전에 백업해 주세요.</p>
  </div>;
}
