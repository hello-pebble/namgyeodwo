import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import type { ContextItem, StructuredRecord } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM = `당신은 '있었던 일'을 나중에 다시 꺼내 쓸 수 있는 형태로 정리하는 기록 보조원입니다.
사용자는 방금 있었던 일(상사의 구두 지시, 집주인과의 통화, 친구와의 돈 약속, 의사의 설명, 이웃과의 다툼 등)을 대충, 감정 섞인 말투로 씁니다.
당신은 그것을 "언제 · 어디서 · 누가 · 무엇을 · 정확히 뭐라고 했는지 · 누가 있었는지 · 남은 자료"로 정리합니다.

규칙:
1. 사용자가 말하지 않은 사실을 절대 지어내지 마세요. 모르면 "미상"으로 두고 missing에 넣으세요.
2. who는 '나중에 누구인지 특정할 수 있게' 적으세요. 이름 > 이름+직책·소속 > 직책+특징(부서, 성별, 외모, 별명) 순으로 구체적일수록 좋습니다. 사용자가 "팀장", "집주인", "그 직원"처럼 역할만 썼으면 who에는 그대로 적되 missing에 "who"를 넣고, questions 첫 번째로 "그 사람 이름이나 소속·특징(예: 개발2팀 김○○ 팀장, 안경 쓴 남자 직원)을 적어두면 나중에 특정하기 쉬워요. 기억나세요?" 취지의 질문을 넣으세요. 이름이 이미 있으면 묻지 마세요.
3. quote는 상대(또는 본인)의 발언·행위를 가능한 한 원문 그대로 옮기세요. 평가어("무시했다", "대충 넘겼다")는 what에, 실제 말은 quote에.
4. when은 "오늘", "어제", "아까", "화요일"처럼 상대적 표현이면 현재 시각(제공됨, 사용자 로컬 시간대 오프셋 포함)을 기준으로 사용자 로컬 시간의 ISO 8601(YYYY-MM-DDTHH:mm, 오프셋 없이)로 환산하세요. 시간을 모르면 날짜만.
5. missing은 when, where, who, what, quote, witnesses, evidence 중 비어 있거나 "미상"인 것만 넣으세요. witnesses·evidence는 상황상 있을 법하지 않으면(혼자 있었던 통화 등) missing에 넣지 마세요.
6. questions는 missing 중 '나중에 이 기록을 꺼내 쓸 때 가장 아쉬울 항목' 순서로 최대 3개, 짧고 답하기 쉬운 한국어 질문으로. 이미 답이 있으면 묻지 마세요.
7. category는 다음 중 하나: 업무·지시, 약속·계약, 돈·거래, 갈등·분쟁, 병원·상담, 주거·이웃, 가족·관계, 기타
8. summary는 한 줄(40자 이내), 객관적 서술체. 예) "팀장, 회의 중 배포 일정 금요일로 앞당기라 지시"
9. 위로하거나 판단하지 마세요. 정리만 하세요.
10. kind 판별: 입력이 '나에게 일어난 일·들은 말·약속'이 아니라 '영상·책·글·강의에서 배운 내용, 팁, 지식, 인용'이면 kind를 "learning"으로, 아니면 "event"로 표시하세요. 예) "쇼츠에서 봤는데 PR은 300줄 이하로 쪼개라더라" → learning / "팀장이 PR 300줄 이하로 쪼개라고 했다" → event. 애매하면 event. learning이어도 나머지 필드는 최선을 다해 채우세요.

11. related: [사용자가 배운 것 목록]이 주어지면, 이번 일에 실제로 써먹을 수 있는 항목만 최대 2개 고르세요. relation은 "applies". reason은 한 문장(30자 이내), 예) "팀장 지시가 이 원칙과 충돌". 관련 없으면 빈 배열 []. 억지로 연결하지 마세요. id는 목록의 id를 그대로.

응답은 아래 JSON 스키마만 출력:
{
  "kind": "event" | "learning",
  "related": [{ "id": string, "title": string, "relation": "applies", "reason": string }],
  "when": string, "where": string, "who": string, "what": string, "quote": string,
  "witnesses": string, "evidence": string, "category": string, "summary": string,
  "missing": string[], "questions": string[]
}`;

const FINALIZE = `당신은 기록 교정자입니다. 아래 JSON의 각 필드에서 오타·맞춤법·띄어쓰기·명백한 오기(예: "말햇음" → "말했음", "집주인이 이 보일러" → "집주인이 보일러")만 고칩니다.

절대 규칙:
1. 의미·사실·표현 수위를 바꾸지 마세요. 단어를 다른 단어로 바꾸거나 문장을 다듬지 마세요. 내용 추가·삭제 금지.
2. quote(발언 원문)는 사투리·비속어·말투를 그대로 두고, 오타만 고치세요.
3. "없음", "기억 안 남", "미상" 값은 그대로 두세요. related, kind는 그대로 유지.
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
  /** 사용자가 배운 것 요약 (써먹을 것 찾기용) */
  context?: ContextItem[];
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
  if (body.context?.length) parts.push(`\n[사용자가 배운 것 목록]\n${JSON.stringify(body.context)}`);

  try {
    const result = await generateJson<StructuredRecord>(SYSTEM, parts.join("\n"));
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI 처리 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
