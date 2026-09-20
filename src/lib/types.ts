export type Category =
  | "업무·지시"
  | "약속·계약"
  | "돈·거래"
  | "갈등·분쟁"
  | "병원·상담"
  | "주거·이웃"
  | "가족·관계"
  | "기타";

export interface StructuredRecord {
  /** 사건 발생 일시 (ISO 또는 "미상") */
  when: string;
  where: string;
  who: string;
  what: string;
  /** 발언·행위를 최대한 원문 그대로 */
  quote: string;
  witnesses: string;
  evidence: string;
  category: Category;
  /** 한 줄 요약 */
  summary: string;
  /** 빠진 항목 키 */
  missing: Array<keyof Pick<StructuredRecord, "when" | "where" | "who" | "what" | "quote" | "witnesses" | "evidence">>;
  /** 빠진 항목에 대한 되묻기 (최대 3개) */
  questions: string[];
  /** AI가 판별한 입력 종류 (learning이면 '배운 것'으로 정리 제안) */
  kind?: RecordKind;
  /** 이 일에 써먹을 수 있는 기존 '배운 것' */
  related?: RelatedHint[];
}

export interface RecordEntry extends StructuredRecord {
  id: string;
  /** 사용자가 처음 입력한 원문 */
  raw: string;
  /** 기록을 남긴 시각 (ISO) — 사용자 브라우저 기준 */
  createdAt: string;
  /** 첨부 파일 이름 목록 (파일 자체는 저장하지 않음) */
  attachments: string[];
}

export interface PatternReport {
  title: string;
  period: string;
  count: number;
  categories: string[];
  patterns: string[];
  /** 기록 성격상 참고할 제도·규정이 있을 때만 (없으면 빈 배열) */
  legalNotes: string[];
  /** 기록의 빈틈을 메우기 위해 지금 할 수 있는 일 */
  nextEvidence: string[];
  draft: string;
  disclaimer: string;
}

/* ---------- 배운 것 기록 ---------- */

export type LearningTopic =
  | "개발·기술"
  | "커리어·업무"
  | "돈·재테크"
  | "건강·생활"
  | "인문·교양"
  | "취미·관심사"
  | "기타";

export interface StructuredLearning {
  /** 한 줄 제목 */
  title: string;
  /** 출처: 채널·영상·책·사람·링크 (사용자가 말한 대로) */
  source: string;
  /** 핵심 주장 한 문장 */
  claim: string;
  /** 기억할 포인트 2~5개 */
  points: string[];
  /** 짧은 태그 2~5개 */
  tags: string[];
  topic: LearningTopic;
  missing: Array<"source" | "claim">;
  questions: string[];
  /** 기존 배운 것과의 연결 */
  related?: RelatedHint[];
}

/** AI가 찾은 기존 기록과의 연결 */
export interface RelatedHint {
  id: string;
  title: string;
  /** same: 같은 얘기 · opposite: 반대 주장 · builds: 이어지는/보완 · applies: 이 일에 써먹을 수 있음 */
  relation: "same" | "opposite" | "builds" | "applies";
  reason: string;
}

/** 요청에 실어 보내는 기존 기록 요약 */
export interface ContextItem {
  id: string;
  title: string;
  tags: string[];
  claim: string;
}

export interface LearningEntry extends StructuredLearning {
  id: string;
  raw: string;
  createdAt: string;
  /** 내 생각·어디에 써먹을지 (선택) */
  myThought: string;
}

/** /api/structure 가 입력을 '배운 것'으로 판단했을 때의 힌트 */
export type RecordKind = "event" | "learning";
