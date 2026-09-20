import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import type { StructuredLearning } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM = `당신은 사용자가 영상·글·강의·대화에서 '배운 것'을 나중에 다시 찾아 쓸 수 있는 지식 카드로 정리하는 보조원입니다.
사용자는 쇼츠를 보고 나서, 책을 읽다가, 누군가의 설명을 듣고 나서 대충 한두 줄로 적습니다.

규칙:
1. 사용자가 말하지 않은 내용을 지어내지 마세요. 배경지식으로 살을 붙이지 마세요. 사용자가 적은 것만 정리합니다.
2. title: 나중에 목록에서 알아볼 수 있는 한 줄 제목 (30자 이내). 예) "PR은 300줄 이하로 쪼개라"
3. source: 사용자가 언급한 출처(채널명, 영상 제목, 책, 사람, 링크)를 말한 그대로. 언급이 없으면 "미상"으로 두고 missing에 "source"를 넣으세요.
4. claim: 핵심 주장 한 문장. 사용자의 표현을 최대한 살리되 문장으로 정리. 주장이 불분명하면 "미상"으로 두고 missing에 "claim".
5. points: 기억할 포인트 2~5개. 사용자가 적은 세부 내용을 짧은 문장으로. 내용이 한 줄뿐이면 1개여도 됩니다.
6. tags: 검색용 짧은 명사 태그 2~5개 (예: "코드리뷰", "PR", "협업"). 한국어, 특수문자 없이.
7. topic: 다음 중 하나: 개발·기술, 커리어·업무, 돈·재테크, 건강·생활, 인문·교양, 취미·관심사, 기타
8. questions: missing이 있을 때만, 최대 2개. 예) "어디서 본 내용인지 채널이나 제목 기억나세요?", "한 문장으로 하면 결론이 뭐였나요?"
9. 판단하거나 평가하지 마세요. 정리만 하세요.

응답은 아래 JSON만 출력:
{ "title": string, "source": string, "claim": string, "points": string[], "tags": string[], "topic": string, "missing": string[], "questions": string[] }`;

const FINALIZE = `당신은 지식 카드 교정자입니다. 아래 JSON의 각 필드에서 오타·맞춤법·띄어쓰기만 고칩니다.
의미·단어·주장을 바꾸지 마세요. 내용 추가·삭제 금지. "미상", "출처 모름" 값은 그대로. missing은 [], questions는 []로 출력.
응답은 입력과 같은 JSON 스키마만 출력.`;

interface Body {
  raw: string;
  previous?: StructuredLearning;
  answers?: string;
  finalize?: boolean;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  if (body.finalize) {
    if (!body.previous) return NextResponse.json({ error: "교정할 내용이 없습니다." }, { status: 400 });
    try {
      const result = await generateJson<StructuredLearning>(FINALIZE, JSON.stringify(body.previous));
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "AI 처리 실패" }, { status: 500 });
    }
  }

  if (!body.raw?.trim()) return NextResponse.json({ error: "내용이 비어 있습니다." }, { status: 400 });

  const parts = [`[사용자 원문]\n${body.raw}`];
  if (body.previous) parts.push(`\n[이전 정리 결과]\n${JSON.stringify(body.previous)}`);
  if (body.answers?.trim()) parts.push(`\n[빠진 항목에 대한 사용자의 추가 답변]\n${body.answers}\n이 답변을 반영해 다시 정리하고, 채워진 항목은 missing과 questions에서 제거하세요.`);

  try {
    const result = await generateJson<StructuredLearning>(SYSTEM, parts.join("\n"));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI 처리 실패" }, { status: 500 });
  }
}
