import { loadLearnings, loadRecords, saveLearnings, saveRecords } from "./storage";
import type { LearningEntry, RecordEntry } from "./types";

const FLAG = "namgyeodwo:sample:v1";
const D = (daysAgo: number, time: string) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}`;
};
const ISO = (daysAgo: number, time: string) => new Date(`${D(daysAgo, time)}:00+09:00`).toISOString();

/** 샘플 배운 것 (id 고정 — 사건 쪽 related에서 참조) */
function sampleLearnings(): LearningEntry[] {
  return [
    {
      id: "sample-l1", title: "PR은 300줄 이하로 쪼개라", source: "출처 모름",
      claim: "PR이 300줄을 넘으면 리뷰어가 집중하지 못하므로 작게 나눠 올린다.",
      points: ["PR 크기 상한을 300줄로 잡는다", "리뷰어의 집중력이 리뷰 품질을 좌우한다"],
      tags: ["코드리뷰", "PR", "협업"], topic: "개발·기술", missing: [], questions: [], related: [],
      raw: "쇼츠에서 봤는데 PR은 300줄 넘기지 말래. 리뷰어가 집중 못 한대",
      createdAt: ISO(9, "22:10"), myThought: "우리 팀 PR 평균 800줄… 다음 스프린트부터 쪼개보자",
    },
    {
      id: "sample-l2", title: "리뷰는 200줄 넘으면 대충 본다", source: "유튜브 개발 채널",
      claim: "리뷰 대상이 200줄을 넘으면 리뷰어가 꼼꼼히 보지 않는다.",
      points: ["200줄이 실질적인 집중 한계", "기능 단위가 아니라 읽기 단위로 쪼개기"],
      tags: ["코드리뷰", "PR"], topic: "개발·기술", missing: [], questions: [],
      related: [{ id: "sample-l1", title: "PR은 300줄 이하로 쪼개라", relation: "same", reason: "PR 크기 얘기와 같은 결론" }],
      raw: "개발 유튜브에서 리뷰 200줄 넘으면 대충 본대", createdAt: ISO(4, "21:30"), myThought: "",
    },
    {
      id: "sample-l3", title: "구두 약속은 바로 문자로 남겨라", source: "책 「협상의 기술」",
      claim: "말로 한 약속은 당일에 문자로 정리해 보내야 나중에 근거가 된다.",
      points: ["\"오늘 말씀하신 대로 ~하겠습니다\" 형식으로 회신", "상대가 답하지 않아도 보낸 기록 자체가 남는다"],
      tags: ["약속", "기록", "협상"], topic: "커리어·업무", missing: [], questions: [], related: [],
      raw: "책에서 읽음. 구두 약속은 그날 문자로 정리해서 보내라", createdAt: ISO(12, "23:00"),
      myThought: "집주인이랑 통화한 것도 이렇게 했어야 했는데",
    },
  ];
}

/** 샘플 있었던 일 (배운 것과 연결됨) */
function sampleRecords(): RecordEntry[] {
  return [
    {
      id: "sample-r1", when: D(12, "10:30"), where: "3층 회의실", who: "개발2팀 김민수 팀장",
      what: "배포 일정을 다음 주 화요일로 안내함", quote: "화요일은 여유 있으니 그때 하자",
      witnesses: "박지훈, 이서연", evidence: "없음", category: "업무·지시",
      summary: "팀장, 배포 일정 화요일로 안내", raw: "팀장이 배포 다음주 화요일이라고 함. 여유있다고",
      createdAt: ISO(12, "10:41"), attachments: [], missing: [], questions: [], kind: "event", related: [],
    },
    {
      id: "sample-r2", when: D(7, "15:10"), where: "전화 통화", who: "집주인 (302호 임대인, 박OO)",
      what: "보일러 수리비를 자신이 부담하겠다고 약속함", quote: "수리비는 내가 낼게요, 걱정 마세요",
      witnesses: "없음", evidence: "기억 안 남", category: "약속·계약",
      summary: "집주인, 보일러 수리비 부담 약속", raw: "집주인이랑 통화함. 보일러 수리비는 자기가 낸다고 했음",
      createdAt: ISO(7, "15:22"), attachments: [], missing: [], questions: [], kind: "event",
      related: [{ id: "sample-l3", title: "구두 약속은 바로 문자로 남겨라", relation: "applies", reason: "통화 약속을 문자로 남길 상황" }],
    },
    {
      id: "sample-r3", when: D(5, "09:50"), where: "팀장 자리", who: "개발2팀 김민수 팀장",
      what: "배포를 목요일로 앞당기라고 구두 지시함", quote: "목요일까지 되지?",
      witnesses: "없음", evidence: "없음", category: "업무·지시",
      summary: "팀장, 배포 목요일로 앞당기라 구두 지시", raw: "아침에 팀장이 갑자기 목요일까지 되냐고 함. 지난주엔 화요일이라며",
      createdAt: ISO(5, "09:58"), attachments: [], missing: [], questions: [], kind: "event",
      related: [{ id: "sample-l3", title: "구두 약속은 바로 문자로 남겨라", relation: "applies", reason: "구두 지시를 메일로 확인할 상황" }],
    },
    {
      id: "sample-r4", when: D(1, "14:30"), where: "3층 회의실", who: "개발2팀 김민수 팀장",
      what: "기능 전체를 PR 하나로 올리라고 지시함", quote: "그냥 한 번에 다 올려",
      witnesses: "박지훈, 이서연", evidence: "기억 안 남", category: "업무·지시",
      summary: "팀장, 기능 전체를 PR 하나로 올리라 지시", raw: "팀장이 아까 회의에서 PR 한 번에 다 올리래",
      createdAt: ISO(1, "14:52"), attachments: [], missing: [], questions: [], kind: "event",
      related: [{ id: "sample-l1", title: "PR은 300줄 이하로 쪼개라", relation: "applies", reason: "팀장 지시가 이 원칙과 충돌" }],
    },
  ];
}

export function hasSample() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FLAG) === "1";
}

/** 기존 기록은 건드리지 않고 샘플만 앞에 추가 */
export function loadSample() {
  const records = loadRecords().filter((r) => !r.id.startsWith("sample-"));
  const learnings = loadLearnings().filter((l) => !l.id.startsWith("sample-"));
  saveRecords([...sampleRecords(), ...records]);
  saveLearnings([...sampleLearnings(), ...learnings]);
  localStorage.setItem(FLAG, "1");
}

/** 샘플만 제거, 사용자가 직접 남긴 기록은 유지 */
export function clearSample() {
  saveRecords(loadRecords().filter((r) => !r.id.startsWith("sample-")));
  saveLearnings(loadLearnings().filter((l) => !l.id.startsWith("sample-")));
  localStorage.removeItem(FLAG);
}
