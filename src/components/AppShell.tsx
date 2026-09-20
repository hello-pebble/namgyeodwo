"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppIcon, { type IconName } from "./AppIcon";

const navigation: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "기록하기", icon: "write" },
  { href: "/records", label: "보관함", icon: "archive" },
  { href: "/report", label: "리포트", icon: "report" },
];

export function SunglassesMark() {
  return <svg className="sunglasses-mark" width="37" height="30" viewBox="0 0 42 32" fill="none" aria-hidden="true"><path d="M3 10c1-6 7-8 11-5 4-5 11-5 15 0 6-1 10 3 10 8v9H3Z" fill="currentColor" /><path d="M4 11h13v4.5a5.5 5.5 0 0 1-11 0Zm21 0h13l-2 5a5.5 5.5 0 0 1-11-.5Z" fill="#111418" /><path d="M15 13.5c4-3.5 8-3.5 12 0" stroke="#111418" strokeWidth="3.5" strokeLinecap="round" /><path d="m18.5 21.5 3.5 3.5 3.5-3.5Z" fill="#111418" /></svg>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = navigation.find((item) => item.href === pathname)?.label ?? "사용 안내";
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">본문으로 이동</a>
    <aside className="app-sidebar no-print">
      <Link className="app-brand" href="/" aria-label="남겨둬 홈"><SunglassesMark /><span>남겨둬<span className="wordmark-dot">.</span></span></Link>
      <p className="sidebar-caption">나의 작고 확실한 기록</p>
      <nav className="desktop-navigation" aria-label="주요 메뉴">
        {navigation.map(({ href, label, icon }) => <Link href={href} key={href} className={pathname === href ? "nav-item is-active" : "nav-item"} aria-current={pathname === href ? "page" : undefined}><AppIcon name={icon} /><span>{label}</span>{pathname === href && <span className="nav-active-dot" />}</Link>)}
      </nav>
      <div className="sidebar-bottom"><Link href="/about" className={pathname === "/about" ? "nav-item is-active" : "nav-item"} aria-current={pathname === "/about" ? "page" : undefined}><AppIcon name="help" />사용 안내</Link><div className="local-storage-note"><AppIcon name="lock" /><p>이 브라우저에 보관해요.<br /><span>중요한 기록은 백업해 두세요.</span></p></div></div>
    </aside>
    <div className="app-body">
      <header className="app-topbar no-print"><div className="desktop-location"><span>내 공간</span><AppIcon name="chevron" width="13" height="13" /><strong>{current}</strong></div><Link href="/" className="mobile-brand app-brand" aria-label="남겨둬 홈"><SunglassesMark /><span>남겨둬.</span></Link><Link href="/about" className="topbar-help" aria-label="사용 안내"><AppIcon name="help" /><span>사용 안내</span></Link></header>
      <main className="app-main" id="main-content">{children}</main>
    </div>
    <nav className="mobile-navigation no-print" aria-label="모바일 주요 메뉴">{navigation.map(({ href, label, icon }) => <Link href={href} key={href} className={pathname === href ? "is-active" : ""} aria-current={pathname === href ? "page" : undefined}><span><AppIcon name={icon} /></span>{label}</Link>)}</nav>
  </div>;
}
