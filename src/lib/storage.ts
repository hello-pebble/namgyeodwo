import type { LearningEntry, RecordEntry } from "./types";

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
