export type ReadingStatus = 'reading' | 'completed' | 'wishlist' | 'paused';

/**
 * 1. 기본 서지 메타데이터 인터페이스 (ISP 준수)
 */
export interface IBookMetadata {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publishDate?: string;
  coverImage: string;
  description: string;
  category: string;
  totalPages?: number;
  tags: string[];
}

/**
 * 2. 독서 기록 서브 모델
 */
export interface ReadingNote {
  id: string;
  page?: number;
  chapter?: string;
  quote?: string;
  thought: string;
  latex?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 3. AI 대화 메시지 서브 모델
 */
export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  referenceQuote?: string;
}

/**
 * 4. 집필용 인사이트 아카이브 모델
 */
export interface WritingInsight {
  id: string;
  title: string;
  concept: string;         // 핵심 학술/공학 개념
  summary: string;         // 개념 요약 및 의미
  latexFormula?: string;   // 관련 수식 (KaTeX)
  myApplication: string;   // ⭐️ 내가 쓸 책에 어떻게 적용할 것인가?
  originalQuote?: string;  // 원문 인용
  sourceChapter?: string;  // 출처 챕터/페이지
  tags: string[];          // 태그 (예: #수치해석, #최적화)
  createdAt: string;
}

/**
 * 5. 카드 및 서재 선반 뷰를 위한 경량 뷰 인터페이스 (ISP: Fat Interface 방지)
 */
export interface IBookSummary extends IBookMetadata {
  currentPage?: number;
  rating?: number;
  status: ReadingStatus;
  notesCount: number;
  insightsCount: number;
  aiChatsCount: number;
}

/**
 * 6. 도서 전체 도메인 모델 (Aggregate Root)
 */
export interface Book extends IBookMetadata {
  currentPage?: number;
  rating?: number;
  status: ReadingStatus;
  startDate?: string;
  endDate?: string;
  notes: ReadingNote[];
  aiChatHistory: AiChatMessage[];
  writingInsights: WritingInsight[];
  summaryReview?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 7. 앱 환경 설정
 */
export interface AppSettings {
  geminiApiKey: string;
  googleClientId: string;
  authorName: string;
  theme: 'dark-library' | 'academic-light' | 'midnight-wood';
}

/**
 * 8. 백업 데이터 스키마
 */
export interface BackupData {
  version: string;
  exportedAt: string;
  authorName: string;
  books: Book[];
  settings?: Partial<AppSettings>;
}
