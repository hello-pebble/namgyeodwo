import type { ContextItem, LearningEntry, RecordEntry } from "./types";

const KEY = "namgyeodwo:records:v1";
const LEARN_KEY = "namgyeodwo:learnings:v1";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function loadRecords(): RecordEntry[] {
  return read<RecordEntry>(KEY);
}

export function saveRecords(records: RecordEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function loadLearnings(): LearningEntry[] {
  return read<LearningEntry>(LEARN_KEY);
}

export function saveLearnings(items: LearningEntry[]) {
  localStorage.setItem(LEARN_KEY, JSON.stringify(items));
}

function download(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJson(records: RecordEntry[]) {
  download(`namgyeodwo-${new Date().toISOString().slice(0, 10)}.json`, records);
}

export function exportLearningsJson(items: LearningEntry[]) {
  download(`namgyeodwo-learnings-${new Date().toISOString().slice(0, 10)}.json`, items);
}

/**
 * AI에 함께 보낼 기존 '배운 것' 요약. 최신순 최대 limit개, 각 항목은 짧게.
 * 서버는 기록을 저장하지 않으므로 연결 찾기는 요청마다 클라이언트가 문맥을 실어 보낸다.
 */
export function buildLearningContext(limit = 120): ContextItem[] {
  return loadLearnings()
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((i) => ({ id: i.id, title: i.title.slice(0, 40), tags: i.tags.slice(0, 5), claim: i.claim.slice(0, 60) }));
}
