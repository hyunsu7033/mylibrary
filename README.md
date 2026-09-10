# 📚 나만의 AI 서재 & 독서 연구소 (My AI Library)

> **"1인 1도서관 시대를 위한 나만의 독립형 프라이빗 AI 서재"**

사용자의 로컬 환경에서 100% 독립적으로 동작하며, 국내외 도서 검색, 맞춤형 3단계 독서 서가(읽는 중, 완독, 위시리스트), AI 북버디와의 인터랙티브 토론 & 퀴즈, 독서 성장 통계 및 데이터 백업을 제공하는 모던 웹 애플리케이션입니다.

---

## ✨ 핵심 주요 기능

1. **🏛️ 3단계 맞춤형 서가 관리**
   - **지금 읽는 중**: 실시간 독서 진척도(%), 시작일 관리 및 AI 토론
   - **완독한 서재**: 완독일, 나만의 별점 평가, 완독 감상평 기록 (Confetti 축하 효과 및 레벨 성장 포인트 지급)
   - **읽고 싶은 위시리스트**: 담아두고 언제든 읽기 시작할 수 있는 관심 서가
   - **도서 검색 & 카테고리 필터**: 문학/동화, 소설, 과학/우주, 철학/인문, 경제/경영 등 즉시 필터링

2. **🔍 YES24 실시간 도서 검색 & 스마트 정렬 엔진 (`/src/lib/yes24.ts`)**
   - **다중 정렬 지원**: 인기도순(`SINDEX_ONLY`), 정확도순(`RELATION`), 신상품순(`RECENT`), 등록일순(`REG_DTS`), 평점순(`CONT_CNT`), 최저가순(`LOW_PRICE`)
   - **수천 권 단위 검색 & 페이지네이션**: '질문' 검색 시 3,500권 이상 실시간 집계 및 24권 단위 페이징
   - **풍부한 서지 정보**: 고화질 표지(XL), 정가, 저자, 출판사, 출간일, 평점, 리뷰 수, 줄거리 자동 파싱
   - **독립 재사용 가능**: 다른 TypeScript/JavaScript 프로젝트에서도 `import { searchYes24 } from '@/lib/yes24'`로 바로 사용 가능
   - **REST API 엔드포인트**: `/api/books/yes24?q={검색어}&order={정렬}&page={페이지}` 제공 (Vercel 배포 시 어디서든 호출 가능)

3. **🤖 AI 북버디 & 스마트 생각노트**
   - 책마다 제공되는 깊이 있는 철학/심리 탐구 질문
   - 책 줄거리와 핵심 주제를 기반으로 한 이해도 확인 퀴즈
   - AI와의 실시간 티키타카 대화 및 감동 구절 '생각노트(Journal)' 스크랩 보관

4. **📊 독서 성장 나무 & 종합 통계 (`/stats`)**
   - 완독 권수와 포인트에 따라 무럭무럭 자라나는 **독서 성장 나무(Lv.1 ~ Lv.10)**
   - 분야별 독서 비율 차트 및 주간/월간 독서 통계

5. **🔒 100% 프라이빗 로컬 스토리지 & 원클릭 백업 (`/settings`)**
   - 모든 서재 데이터, 독서 기록, AI 생각노트는 사용자의 브라우저 로컬 저장소에 안전하게 저장
   - 언제든 JSON 단일 파일로 전체 데이터 내보내기/불러오기(복원) 지원

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Canvas-Confetti
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Data Storage**: Client-side LocalStorage Engine with JSON Backup/Restore

---

## 🚀 빠른 시작 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3005`로 접속합니다.

### 3. 프로덕션 빌드
```bash
npm run build
npm run start
```

---

## 📄 라이선스
MIT License
