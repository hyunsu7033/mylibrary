# 📚 My Scholar Library & Idea Vault
> **수학·공학 LaTeX 수식 지원, YES24 도서 자동 연동, AI 심층 토론, 집필용 인사이트 아카이브 및 Google Drive 클라우드 백업을 지원하는 프리미엄 개인 서재**

---

## 🌟 주요 핵심 기능

1. **📖 개인 서재 & 독서 기록 관리**
   - 읽은 책 중심의 독서 기록 (원목 책장 선반 3D 뷰, 카드 그리드 뷰, 리스트 뷰)
   - 독서 상태(읽는 중, 완독, 읽고 싶은 책), 진행 페이지, 별점, 카테고리 태그 관리
   - 챕터별 인용구, 나의 생각, 총평/서평 기록

2. **🔍 YES24 도서 정보 & 표지 이미지 자동 연동**
   - 도서명, 저자, 또는 13자리 ISBN 검색으로 YES24에서 고화질 표지 이미지 및 서지 정보 자동 수집
   - 원서, 미발매 도서, 자체 강의록을 위한 직접 도서 등록 폼 지원

3. **∑ 수학·공학용 LaTeX 수식 완벽 지원 (KaTeX)**
   - 인라인 수식(`$...$`) 및 블록 수식(`$$...$$`) 실시간 렌더링
   - 미적분, 편미분, 행렬, 극한, 그리스 문자, 슈뢰딩거/맥스웰 방정식 빠른 입력 툴바 제공

4. **💬 책 맥락 기반 AI 심층 토론 (Google Gemini)**
   - 내가 기록한 독서 메모, 인용구, 수식을 컨텍스트로 주입하여 학술적 토론 진행
   - 소크라테스식 문답, 수학적 증명 검토, 저자의 논리 비판 및 확장 관점 제시

5. **💡 책 하단 집필용 인사이트 보관소 (Author's Vault)**
   - AI와의 대화 중 나온 핵심 통찰이나 독서 중 떠오른 아이디어를 원클릭으로 구조화된 "집필 카드"로 보관
   - **내가 쓸 책에 어떻게 적용할 것인가? (Author's Application)** 항목 구조화
   - 원고 작성 시 즉시 활용할 수 있도록 **Markdown / LaTeX 복사 및 .md 파일 전체 내보내기** 지원

6. **☁️ Google Drive 클라우드 백업 & 복원**
   - Google Identity Services를 통한 원클릭 구글 계정 연동
   - 내 구글 드라이브에 독서 기록 및 집필 노트 자동 백업 및 언제 어디서나 복원 동기화
   - 오프라인용 로컬 JSON 파일 백업/가져오기 동시 지원

---

## 🚀 GitHub & Vercel 배포 방법

### 1. GitHub 저장소에 푸시하기
```bash
git init
git add .
git commit -m "feat: 개인 서재 및 독서 인사이트 웹 애플리케이션"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### 2. Vercel에 원클릭 배포하기
1. [Vercel 대시보드](https://vercel.com)에 로그인합니다.
2. **Add New...** > **Project**를 클릭하고 방금 푸시한 GitHub 저장소를 선택(Import)합니다.
3. Framework Preset은 **Vite**로 자동 감지됩니다.
4. **Deploy** 버튼을 누르면 약 1분 내에 전 세계 어디서나 접속 가능한 고유 URL이 생성됩니다.

---

## 🔑 환경 설정 안내

웹 앱 우측 상단의 **[설정 ⚙️]** 메뉴에서 다음 값을 입력하여 모든 기능을 활성화할 수 있습니다:

1. **Google Gemini API Key**:
   - [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료로 발급받아 입력합니다. (AI 심층 토론 및 집필 인사이트 자동 추출에 사용)
2. **Google OAuth Client ID** (구글 드라이브 백업용):
   - [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 **OAuth 2.0 웹 클라이언트 ID**를 생성하여 입력합니다.
   - 승인된 자바스크립트 원본에 배포된 Vercel URL(예: `https://your-app.vercel.app`) 및 `http://localhost:5173`을 등록합니다.

---

## 🛠️ 기술 스택
- **Frontend**: React 19, TypeScript, Vite, Lucide Icons, KaTeX, Canvas Confetti
- **Styling**: Luxury Scholar's Library Dark Theme (Vanilla CSS / Tailwind)
- **Backend / API**: Vercel Serverless Functions (`/api/search.js`)
- **Cloud & Sync**: Google Drive REST API, Google Identity Services, LocalStorage
