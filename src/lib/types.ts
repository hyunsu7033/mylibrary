export type ReadingStatus = 'reading' | 'completed' | 'wishlist';

export interface PersonalBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  isbn: string;
  price: number;
  coverUrl: string;
  yes24Url: string;
  category: string;
  summary: string;
  readingStatus: ReadingStatus;
  progressPercent: number; // 0 ~ 100
  rating?: number; // 1 ~ 5
  reviewText?: string;
  startedAt?: string; // YYYY.MM.DD
  completedAt?: string; // YYYY.MM.DD
  tags: string[];
  coverEmoji?: string;
  deepQuestions?: {
    question: string;
    focus: string;
  }[];
  sampleQuizzes?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }[];
}

export interface SavedThought {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  category?: string;
  userQuestion: string;
  aiResponse: string;
  savedAt: string; // YYYY.MM.DD HH:mm:ss
}

export interface PersonalProfile {
  ownerName: string;      // 서재 주인 이름 (예: 김민준)
  libraryTitle: string;   // 서재 명칭 (예: 민준이의 지혜의 서재)
  motto: string;          // 독서 좌우명
  avatarEmoji: string;    // 아바타 이모지 (예: 🦊, 🦉, 🚀)
  geminiApiKey?: string;  // Google AI Studio Key
  readingPoints: number;  // 누적 독서 포인트
  level: number;          // 독서 레벨 (1~10)
  totalCompleted: number; // 총 완독 권수
  joinedAt: string;       // 서재 개설일
}
