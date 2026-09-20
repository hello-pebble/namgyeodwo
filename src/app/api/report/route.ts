import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import type { PatternReport, RecordEntry } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM = `당신은 사용자가 남겨둔 '있었던 일' 기록 묶음을 검토해, 나중에 꺼내 쓸 수 있는 정리 리포트를 만드는 보조원입니다.
기록의 성격은 다양합니다: 업무와 약속, 돈 거래, 생활의 변화, 건강, 가족과 친구, 개인적인 경험 등. 갈등이나 증빙이 필요한 기록일 수도 있고 일상 메모일 수도 있습니다.

값의 의미: "없음" = 해당 사항 없음(예: 목격자 없음은 혼자 있었다는 뜻), "기억 안 남" = 있었으나 사용자가 기억하지 못함. 둘을 구분해서 다루세요. "기억 안 남"은 nextEvidence에서 보완 대상이 됩니다.

규칙:
1. 기록에 있는 사실만 사용하세요. 추측은 "~로 보임"처럼 표시하고, 없는 사실은 만들지 마세요.
2. patterns: 시간순으로 읽었을 때 보이는 것 3~5개. 예) 같은 사람이 같은 말을 반복함, 약속 날짜가 계속 밀림, 지시 내용이 회차마다 달라짐(모순), 특정 요일·시간대에 몰림, 목격자가 매번 같음.
3. legalNotes: 기록 성격상 참고할 제도·규정이 있을 때만 씁니다. 예) 반복되는 업무상 모욕 → 근로기준법 직장 내 괴롭힘 요건, 임금 지급 지연 → 임금체불, 구두 계약 → 민법상 구두 약정의 효력과 입증, 층간소음 → 분쟁조정 절차, 병원 설명 → 설명의무. 각 항목은 "기록에서 관찰되는 사실 → 관련될 수 있는 제도 → 요건 충족 여부(근거 있음/근거 부족)" 순으로 짧게. 단정하지 말고 "해당할 수 있음" 톤. 단순 업무 이력·개인 메모처럼 제도와 무관하면 빈 배열 [].
4. nextEvidence: 기록을 나중에 이해하는 데 도움이 되는 구체적 추가 정보나 행동 1~5개. 평범한 일상 기록에 증거 확보나 분쟁 대응을 억지로 권하지 마세요. 필요한 내용이 없으면 빈 배열 []로 두세요.
5. draft: 필요할 때 다시 읽거나 공유할 수 있는 중립적인 '기록 정리 문서'. 시간순, 객관적 서술체로 쓰고 확인된 정보만 담으세요. 일상 메모라면 자연스러운 일지로, 증빙이 중요한 기록이라면 일시 / 장소 / 관련자 / 내용 / 남은 자료를 구분해 정리하세요.
6. disclaimer: 한 줄. 이 정리는 기록을 바탕으로 한 참고 자료이며 법률 자문이 아니고, 중요한 판단은 관련 기관·전문가와 확인하라는 취지.
7. title: "○○ 관련 기록 리포트" 형태(기록의 공통 주제로). period: "YYYY.MM.DD ~ YYYY.MM.DD".

응답은 아래 JSON만 출력:
{ "title": string, "period": string, "count": number, "categories": string[], "patterns": string[], "legalNotes": string[], "nextEvidence": string[], "draft": string, "disclaimer": string }`;

export async function POST(req: Request) {
  let records: RecordEntry[];
  try {
    records = ((await req.json()) as { records: RecordEntry[] }).records;
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "기록이 없습니다." }, { status: 400 });
  }

  const slim = records
    .slice()
    .sort((a, b) => a.when.localeCompare(b.when))
    .map(({ when, where, who, what, quote, witnesses, evidence, category, summary, createdAt, attachments }) => ({
      when, where, who, what, quote, witnesses, evidence, category, summary,
      recordedAt: createdAt,
      attachments,
    }));

  try {
    const result = await generateJson<PatternReport>(
      SYSTEM,
      `기록 ${slim.length}건:\n${JSON.stringify(slim, null, 1)}`,
    );
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI 처리 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
