"use client";

import Link from "next/link";
import AppIcon from "./AppIcon";
import type { RelatedHint } from "@/lib/types";

const LABEL: Record<RelatedHint["relation"], string> = {
  same: "같은 얘기",
  opposite: "반대 주장",
  builds: "이어짐",
  applies: "써먹기",
};

interface Props {
  items: RelatedHint[];
  title: string;
  compact?: boolean;
}

/** AI가 찾은 기존 '배운 것'과의 연결을 보여주는 상자 */
export default function RelatedBox({ items, title, compact = false }: Props) {
  if (!items?.length) return null;
  return <div className={compact ? "related-box compact" : "related-box"} role="note">
    <strong><AppIcon name="book" width="14" height="14" />{title}</strong>
    <ul>
      {items.map((r) => <li key={r.id}>
        <span className={`relation-badge relation-${r.relation}`}>{LABEL[r.relation]}</span>
        <Link href={`/learn?focus=${encodeURIComponent(r.id)}`} className="related-title">{r.title}</Link>
        <span className="related-reason">{r.reason}</span>
      </li>)}
    </ul>
  </div>;
}
