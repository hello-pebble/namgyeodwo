import { GoogleGenAI } from "@google/genai";

const PRIMARY = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
/** 1차 모델이 과부하(503)·한도(429)일 때 시도할 모델들 (쉼표 구분) */
const FALLBACKS = (process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.5-flash-lite,gemini-3.5-flash")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

let client: GoogleGenAI | null = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

function statusOf(e: unknown): number | undefined {
  if (!e || typeof e !== "object") return undefined;
  const any = e as { status?: unknown; code?: unknown; message?: unknown };
  if (typeof any.status === "number") return any.status;
  if (typeof any.code === "number") return any.code;
  const m = String(any.message ?? "").match(/"code":\s*(\d{3})/) ?? String(any.message ?? "").match(/\b(429|500|503|404)\b/);
  return m ? Number(m[1]) : undefined;
}

const RETRYABLE = new Set([429, 500, 503]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as T;
  }
}

async function callOnce<T>(model: string, systemInstruction: string, userText: string): Promise<T> {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model,
    contents: userText,
    config: { systemInstruction, responseMimeType: "application/json", temperature: 0.2 },
  });
  return parseJson<T>(res.text ?? "");
}

/**
 * JSON 응답을 강제하고 파싱까지 수행.
 * 과부하·한도 오류면 같은 모델로 2회 재시도(0.8s, 2s) 후 폴백 모델로 넘어감.
 */
export async function generateJson<T>(systemInstruction: string, userText: string): Promise<T> {
  const models = [PRIMARY, ...FALLBACKS.filter((m) => m !== PRIMARY)];
  let lastErr: unknown;
  /** 과부하·한도 오류를 한 번이라도 만났는지 — 최종 안내 문구 결정용 */
  let sawBusy = false;
  let sawMissing = false;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callOnce<T>(model, systemInstruction, userText);
      } catch (e) {
        lastErr = e;
        const st = statusOf(e);
        if (st === 404) { sawMissing = true; break; } // 이 모델은 없음 → 다음 모델
        if (!RETRYABLE.has(st ?? 0)) throw e; // 키 오류 등은 즉시 실패
        sawBusy = true;
        if (attempt < 2) await sleep(attempt === 0 ? 800 : 2000);
      }
    }
  }

  if (sawBusy) {
    throw new Error("AI 서버가 지금 붐벼요. 10초 뒤에 다시 눌러주세요. (입력한 내용은 그대로 남아 있습니다)");
  }
  if (sawMissing) {
    throw new Error(`설정된 AI 모델(${models.join(", ")})을 찾을 수 없어요. GEMINI_MODEL 환경변수를 확인해 주세요.`);
  }
  throw lastErr instanceof Error ? lastErr : new Error("AI 처리 실패");
}
