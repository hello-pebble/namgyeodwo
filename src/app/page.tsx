"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Recorder from "@/components/Recorder";
import Timeline from "@/components/Timeline";
import AppIcon from "@/components/AppIcon";
import { loadLearnings, loadRecords, saveLearnings, saveRecords } from "@/lib/storage";
import { clearSample, hasSample, loadSample } from "@/lib/sample";
import type { LearningEntry, RecordEntry } from "@/lib/types";

export default function Home() {
  return <Suspense fallback={null}><HomeInner /></Suspense>;
}

function HomeInner() {
  const params = useSearchParams();
  const initialMode = params.get("mode") === "learning" ? "learning" : "event";
  const [learnCount, setLearnCount] = useState(0);
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [date, setDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [sample, setSample] = useState(false);

  useEffect(() => {
    setRecords(loadRecords());
    setLearnCount(loadLearnings().length);
    setSample(hasSample());
    setDate(new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" }));
    setReady(true);
  }, []);

  function update(next: RecordEntry[]) {
    saveRecords(next);
    setRecords(next);
  }

  function refresh() {
    setRecords(loadRecords());
    setLearnCount(loadLearnings().length);
    setSample(hasSample());
  }

  function addLearning(entry: LearningEntry) {
    const next = [entry, ...loadLearnings()];
    saveLearnings(next);
    setLearnCount(next.length);
    setSaved(true);
  }

  return <div className="home-page">
    <div className="page-heading"><div><h1>오늘의 기록</h1><p>별일 아닌 일도, 남겨두면 내 기록.</p></div><span className="today-date"><AppIcon name="calendar" width="16" height="16" />{date || "오늘"}</span></div>

    <section className="penguin-welcome" aria-label="펭귄의 한마디">
      <div className="penguin-message"><span className="mascot-caption"><span />기억 담당 펭귄</span><h2>오늘 무슨 일 있었어?<br />까먹기 전에 남겨둬.</h2><p>한 줄이어도 괜찮아. 내가 정리해줄게.</p></div>
      <div className="penguin-portrait"><Image src="/brand/penguin-notes.png" alt="선글라스를 끼고 노란 메모장을 든 통통한 펭귄" width={1280} height={1280} sizes="(max-width: 600px) 180px, 280px" priority /></div>
      <div className="penguin-caption" aria-hidden="true">기록할 준비 완료!</div>
    </section>

    {saved && <div className="saved-message" role="status"><AppIcon name="check" /><span>잘 남겨뒀어! 보관함이나 배운 것에서 언제든 꺼내봐.</span><button type="button" aria-label="저장 알림 닫기" onClick={() => setSaved(false)}><AppIcon name="close" width="16" height="16" /></button></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {sample && <div className="sample-banner" role="status"><AppIcon name="archive" width="15" height="15" /><span>지금 <b>샘플 기록</b>을 보고 있어요. 보관함·배운 것·리포트를 둘러본 뒤 지워도 돼요.</span><button type="button" onClick={() => { clearSample(); refresh(); }}>샘플 지우기</button></div>}
    {ready && !sample && records.length === 0 && learnCount === 0 && <div className="sample-invite"><span><b>처음이세요?</b> 샘플 기록 7건을 넣어 연결·리포트를 바로 둘러볼 수 있어요.</span><button type="button" onClick={() => { loadSample(); refresh(); }}><AppIcon name="arrow" width="14" height="14" />샘플로 둘러보기</button></div>}
    <div className="home-workspace">
      <Recorder initialMode={initialMode} onSave={(entry) => { update([entry, ...records]); setSaved(true); }} onSaveLearning={addLearning} />
      <aside className="recent-panel" aria-labelledby="recent-title">
        <div className="panel-heading"><h2 id="recent-title">최근 기록 <span>{ready ? records.length : 0}</span></h2><Link href="/records" className="subtle-link">전체 보기<AppIcon name="chevron" width="14" height="14" /></Link></div>
        {ready && <Timeline compact records={records.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)} onDelete={(id) => { if (window.confirm("이 기록을 삭제할까요? 삭제하면 되돌릴 수 없습니다.")) { try { update(records.filter((record) => record.id !== id)); } catch { setError("기록을 삭제하지 못했어요. 브라우저 저장 공간을 확인해 주세요."); } } }} />}
        <Link href="/learn" className="report-shortcut learn-shortcut"><span className="report-shortcut-icon"><AppIcon name="book" /></span><span><strong>배운 것 {learnCount > 0 ? `${learnCount}개` : ""}</strong><small>쇼츠·책에서 건진 것도 여기에</small></span><AppIcon name="chevron" width="16" height="16" /></Link>
        <Link href="/report" className="report-shortcut"><span className="report-shortcut-icon"><AppIcon name="report" /></span><span><strong>모아서 보면 또 달라요</strong><small>남겨둔 기록을 리포트로 정리하기</small></span><AppIcon name="chevron" width="16" height="16" /></Link>
      </aside>
    </div>
    <p className="home-storage-note"><AppIcon name="lock" width="13" height="13" />기록은 이 브라우저에 보관돼요. 중요한 기록은 보관함에서 백업해 주세요.</p>
  </div>;
}
