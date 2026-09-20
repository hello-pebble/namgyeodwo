# 남겨둬 (namgyeodwo)

> 흘려보내기 전에, 남겨둬.

업무, 약속, 건강, 생활의 변화까지 **기억하고 싶은 일**을 한 줄로 남기면
AI가 일시, 사람, 내용을 정리합니다. 기록을 모아 리포트와 정리 문서도 만들 수 있습니다.
저장한 기록은 서버에 보관되지 않고 현재 브라우저에만 남습니다. AI 정리 요청 시 입력 내용은 처리 서버로 전송됩니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # GEMINI_API_KEY 입력
npm run dev                  # http://localhost:3000
```

Gemini API 키는 https://aistudio.google.com/apikey 에서 무료 발급.

## Vercel 배포

1. GitHub에 push
2. https://vercel.com/new 에서 저장소 import (프레임워크 자동 감지: Next.js)
3. Environment Variables에 `GEMINI_API_KEY` 추가
4. Deploy → `https://namgyeodwo.vercel.app` 형태의 주소 발급

## 구조

```
src/app/page.tsx              메인: 입력 → AI 구조화 → 확인 → 기록 목록
src/app/report/page.tsx       기록 리포트 + 정리 문서 + PDF(인쇄)
src/app/about/page.tsx        서비스 소개 및 저장 방식
src/app/api/structure/route.ts  Gemini: 자유 서술 → 5W1H JSON + 누락 항목 질문
src/app/api/report/route.ts     Gemini: 기록 묶음 → 패턴·빈틈 메우기·정리서·(해당 시) 제도 안내
src/lib/storage.ts            localStorage 저장/백업
```

## 기술 구성

Next.js 16 · TypeScript · Tailwind CSS 4 · Google Gemini (`@google/genai`) · Vercel
