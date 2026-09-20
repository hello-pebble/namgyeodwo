import type { RecordEntry } from "./types";

const KEY = "namgyeodwo:records:v1";

export function loadRecords(): RecordEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecordEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: RecordEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function exportJson(records: RecordEntry[]) {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `namgyeodwo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
