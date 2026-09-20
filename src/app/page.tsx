"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Recorder from "@/components/Recorder";
import Timeline from "@/components/Timeline";
import AppIcon from "@/components/AppIcon";
import { loadRecords, saveRecords } from "@/lib/storage";
import type { RecordEntry } from "@/lib/types";

export default function Home() {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [date, setDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRecords(loadRecords());
    setDate(new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" }));
    setReady(true);
  }, []);

  function update(next: RecordEntry[]) {
    saveRecords(next);
    setRecords(next);
  }

  return <div className="home-page">
    <div className="page-heading"><div><h1>오늘의 기록</h1><p>별일 아닌 일도, 남겨두면 내 기록.</p></div><span className="today-date"><AppIcon name="calendar" width="16" height="16" />{date || "오늘"}</span></div>

    <section className="penguin-welcome" aria-label="펭귄의 한마디">
      <div className="penguin-message"><span className="mascot-caption"><span />기억 담당 펭귄</span><h2>오늘 무슨 일 있었어?<br />까먹기 전에 남겨둬.</h2><p>한 줄이어도 괜찮아. 내가 정리해줄게.</p></div>
      <div className="penguin-portrait"><Image src="/brand/penguin-notes.png" alt="선글라스를 끼고 노란 메모장을 든 통통한 펭귄" width={1280} height={1280} sizes="(max-width: 600px) 180px, 280px" priority /></div>
      <div className="penguin-caption" aria-hidden="true">기록할 준비 완료!</div>
    </section>

    {saved && <div className="saved-message" role="status"><AppIcon name="check" /><span>잘 남겨뒀어! 보관함에서 언제든 꺼내봐.</span><button type="button" aria-label="저장 알림 닫기" onClick={() => setSaved(false)}><AppIcon name="close" width="16" height="16" /></button></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="home-workspace">
      <Recorder onSave={(entry) => { update([entry, ...records]); setSaved(true); }} />
      <aside className="recent-panel" aria-labelledby="recent-title">
        <div className="panel-heading"><h2 id="recent-title">최근 기록 <span>{ready ? records.length : 0}</span></h2><Link href="/records" className="subtle-link">전체 보기<AppIcon name="chevron" width="14" height="14" /></Link></div>
        {ready && <Timeline compact records={records.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)} onDelete={(id) => { if (window.confirm("이 기록을 삭제할까요? 삭제하면 되돌릴 수 없습니다.")) { try { update(records.filter((record) => record.id !== id)); } catch { setError("기록을 삭제하지 못했어요. 브라우저 저장 공간을 확인해 주세요."); } } }} />}
        <Link href="/report" className="report-shortcut"><span className="report-shortcut-icon"><AppIcon name="report" /></span><span><strong>모아서 보면 또 달라요</strong><small>남겨둔 기록을 리포트로 정리하기</small></span><AppIcon name="chevron" width="16" height="16" /></Link>
      </aside>
    </div>
    <p className="home-storage-note"><AppIcon name="lock" width="13" height="13" />기록은 이 브라우저에 보관돼요. 중요한 기록은 보관함에서 백업해 주세요.</p>
  </div>;
}
