"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RelatedBox from "@/components/RelatedBox";
import AppIcon from "@/components/AppIcon";
import { exportLearningsJson, loadLearnings, saveLearnings } from "@/lib/storage";
import type { LearningEntry } from "@/lib/types";

const TOPIC_ORDER = ["개발·기술", "커리어·업무", "돈·재테크", "건강·생활", "인문·교양", "취미·관심사", "기타"];

export default function LearnPage() {
  return <Suspense fallback={null}><LearnInner /></Suspense>;
}

function LearnInner() {
  const focus = useSearchParams().get("focus");
  const [items, setItems] = useState<LearningEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("전체");
  const [tag, setTag] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { setItems(loadLearnings()); setReady(true); }, []);
  useEffect(() => {
    if (!ready || !focus) return;
    const el = document.getElementById(`learn-${focus}`);
    if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("is-focused"); }
  }, [ready, focus]);

  const topics = ["전체", ...TOPIC_ORDER.filter((t) => items.some((i) => i.topic === t))];
  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((i) => i.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24);
  }, [items]);

  const q = search.trim().toLocaleLowerCase();
  const filtered = items
    .filter((i) => (topic === "전체" || i.topic === topic) && (!tag || i.tags.includes(tag)) && [i.title, i.claim, i.source, i.raw, i.myThought, ...i.points, ...i.tags].join(" ").toLocaleLowerCase().includes(q))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const grouped = TOPIC_ORDER.map((t) => [t, filtered.filter((i) => i.topic === t)] as const).filter(([, list]) => list.length > 0);

  function remove(id: string) {
    if (!window.confirm("이 배운 것을 삭제할까요? 삭제하면 되돌릴 수 없습니다.")) return;
    try {
      const next = items.filter((i) => i.id !== id);
      saveLearnings(next);
      setItems(next);
    } catch { setError("삭제하지 못했어요. 브라우저 저장 공간을 확인해 주세요."); }
  }

  return <div className="library-page">
    <div className="page-heading"><div><h1>배운 것 <span className="heading-count">{items.length}</span></h1><p>쇼츠, 책, 강의에서 건진 것들. 주제와 태그로 다시 찾아요.</p></div>{items.length > 0 && <button type="button" className="secondary-action" onClick={() => exportLearningsJson(items)}><AppIcon name="download" width="16" height="16" />백업하기</button>}</div>
    <div className="library-toolbar"><label className="search-field"><AppIcon name="search" /><input type="search" aria-label="배운 것 검색" placeholder="제목, 주장, 출처, 태그로 찾아보세요" value={search} onChange={(e) => setSearch(e.target.value)} /></label><Link href="/?mode=learning" className="primary-action"><AppIcon name="book" width="16" height="16" />새로 남기기</Link></div>
    <div className="category-filters" aria-label="주제">{topics.map((t) => <button key={t} type="button" aria-pressed={topic === t} className={topic === t ? "is-selected" : ""} onClick={() => setTopic(t)}>{t}</button>)}</div>
    {tagCounts.length > 0 && <div className="tag-cloud" aria-label="태그">{tagCounts.map(([t, n]) => <button key={t} type="button" aria-pressed={tag === t} className={tag === t ? "is-selected" : ""} onClick={() => setTag(tag === t ? null : t)}><AppIcon name="tag" width="11" height="11" />{t}<span>{n}</span></button>)}</div>}
    {error && <p className="form-error" role="alert">{error}</p>}

    {ready && filtered.length === 0 && <div className="empty-records"><div className="empty-drawing" aria-hidden="true"><AppIcon name={items.length > 0 ? "search" : "book"} width="34" height="34" /><span /></div><h3>{items.length > 0 ? "찾는 내용이 없어요" : "아직 배운 것이 없어요"}</h3><p>{items.length > 0 ? "다른 단어로 찾거나 필터를 바꿔보세요." : "쇼츠 하나 보고 나서 한 줄만.\n출처랑 같이 남기면 나중에 다시 찾기 쉬워요."}</p></div>}

    {grouped.map(([t, list]) => <section key={t} className="wiki-section" aria-label={t}>
      <h2 className="wiki-topic">{t} <span>{list.length}</span></h2>
      <div className="wiki-grid">
        {list.map((i) => <article key={i.id} id={`learn-${i.id}`} className="wiki-card">
          <header><h3>{i.title}</h3><span className="record-date">{new Date(i.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span></header>
          <p className="wiki-claim">{i.claim}</p>
          {i.points.length > 0 && <ul className="wiki-points">{i.points.map((p) => <li key={p}>{p}</li>)}</ul>}
          {i.myThought && <p className="wiki-thought"><b>내 생각</b> {i.myThought}</p>}
          <RelatedBox compact items={(i.related ?? []).filter((r) => items.some((x) => x.id === r.id))} title="연결" />
          <footer>
            <span className="wiki-source" title={i.source}>{/^https?:\/\//.test(i.source) ? <a href={i.source} target="_blank" rel="noreferrer">{i.source.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}</a> : i.source}</span>
            <span className="wiki-tags">{i.tags.map((tg) => <button key={tg} type="button" onClick={() => setTag(tag === tg ? null : tg)} className={tag === tg ? "is-selected" : ""}>#{tg}</button>)}</span>
            <button type="button" className="wiki-delete" onClick={() => remove(i.id)} aria-label={`${i.title} 삭제`}><AppIcon name="trash" width="13" height="13" /></button>
          </footer>
        </article>)}
      </div>
    </section>)}
    <p className="library-footnote"><AppIcon name="lock" width="13" height="13" />이 브라우저에 저장된 기록이에요. 브라우저 데이터를 지우기 전에 백업해 주세요.</p>
  </div>;
}
