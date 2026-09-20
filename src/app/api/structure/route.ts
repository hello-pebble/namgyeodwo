import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import type { StructuredRecord } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM = `당신은 '있었던 일'을 나중에 다시 꺼내 쓸 수 있는 형태로 정리하는 기록 보조원입니다.
사용자는 업무, 약속, 돈 거래, 건강, 가족, 취미, 생활의 변화 등 일상에서 기억하고 싶은 일을 자유롭게 씁니다. 중요한 증빙 기록도 있을 수 있지만, 단순한 개인 메모도 있습니다.
당신은 그것을 "언제 · 어디서 · 누가 · 무엇을 · 정확히 뭐라고 했는지 · 누가 있었는지 · 남은 자료"로 정리합니다.

규칙:
1. 사용자가 말하지 않은 사실을 절대 지어내지 마세요. 모르면 "미상"으로 두고 missing에 넣으세요.
2. who는 관련자가 있으면 사용자가 적은 이름이나 관계를 그대로 정리하세요. 기록에 사람이 중요하지만 "팀장", "그 직원"처럼 모호할 때만 missing에 "who"를 넣고, 구별할 수 있는 정보를 짧게 물어보세요. 혼자 한 일이나 사람이 관계없는 메모라면 "없음"으로 두고 묻지 마세요.
3. quote는 실제 발언이 있을 때만 가능한 한 원문 그대로 옮기세요. 말이 등장하지 않는 기록이라면 "없음"으로 두세요. 평가어("무시했다", "대충 넘겼다")는 what에, 실제 말은 quote에.
4. when은 "오늘", "어제", "아까", "화요일"처럼 상대적 표현이면 현재 시각(제공됨, 사용자 로컬 시간대 오프셋 포함)을 기준으로 사용자 로컬 시간의 ISO 8601(YYYY-MM-DDTHH:mm, 오프셋 없이)로 환산하세요. 시간을 모르면 날짜만.
5. 관련 없는 항목은 "없음"으로 두고 missing에 넣지 마세요. 예를 들어 단순한 개인 메모에는 장소·발언·목격자·증거가 필요하지 않을 수 있습니다. missing에는 기록을 다시 이해하는 데 실제로 필요한데 비어 있거나 "미상"인 항목만 넣으세요.
6. questions는 missing 중 나중에 다시 볼 때 가장 도움이 되는 항목부터 최대 3개만, 짧고 답하기 쉬운 한국어로 물어보세요. 이미 답이 있거나 중요하지 않은 내용은 묻지 마세요.
7. category는 다음 중 하나: 업무·지시, 약속·계약, 돈·거래, 갈등·분쟁, 병원·상담, 주거·이웃, 가족·관계, 기타
8. summary는 한 줄(40자 이내), 객관적 서술체. 예) "팀장, 회의 중 배포 일정 금요일로 앞당기라 지시"
9. 위로하거나 판단하지 마세요. 정리만 하세요.

응답은 아래 JSON 스키마만 출력:
{
  "when": string, "where": string, "who": string, "what": string, "quote": string,
  "witnesses": string, "evidence": string, "category": string, "summary": string,
  "missing": string[], "questions": string[]
}`;

const FINALIZE = `당신은 기록 교정자입니다. 아래 JSON의 각 필드에서 오타·맞춤법·띄어쓰기·명백한 오기(예: "말햇음" → "말했음", "집주인이 이 보일러" → "집주인이 보일러")만 고칩니다.

절대 규칙:
1. 의미·사실·표현 수위를 바꾸지 마세요. 단어를 다른 단어로 바꾸거나 문장을 다듬지 마세요. 내용 추가·삭제 금지.
2. quote(발언 원문)는 사투리·비속어·말투를 그대로 두고, 오타만 고치세요.
3. "없음", "기억 안 남", "미상" 값은 그대로 두세요.
4. when은 형식만 확인(YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm). 값 변경 금지.
5. missing은 [], questions는 []로 출력.
6. 고칠 게 없으면 입력 그대로 출력.

응답은 입력과 같은 JSON 스키마만 출력.`;

interface Body {
  raw: string;
  previous?: StructuredRecord;
  answers?: string;
  now?: string;
  /** 저장 직전 교정 모드 */
  finalize?: boolean;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  if (!body.raw?.trim()) {
    return NextResponse.json({ error: "내용이 비어 있습니다." }, { status: 400 });
  }

  if (body.finalize) {
    if (!body.previous) return NextResponse.json({ error: "교정할 내용이 없습니다." }, { status: 400 });
    try {
      const result = await generateJson<StructuredRecord>(FINALIZE, JSON.stringify(body.previous));
      return NextResponse.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI 처리 실패";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  const now = body.now ?? new Date().toISOString();
  const parts = [`현재 시각: ${now}`, `\n[사용자 원문]\n${body.raw}`];
  if (body.previous) {
    parts.push(`\n[이전 정리 결과]\n${JSON.stringify(body.previous)}`);
  }
  if (body.answers?.trim()) {
    parts.push(`\n[빠진 항목에 대한 사용자의 추가 답변]\n${body.answers}\n이 답변을 반영해 다시 정리하고, 답변으로 채워진 항목은 missing과 questions에서 제거하세요.`);
  }

  try {
    const result = await generateJson<StructuredRecord>(SYSTEM, parts.join("\n"));
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI 처리 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
