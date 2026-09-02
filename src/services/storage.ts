import { Book, AppSettings, BackupData } from '../types/book';
import { LocalStorageBookRepository } from './storage/LocalStorageBookRepository';
import { JsonBackupSerializer } from './storage/JsonBackupSerializer';

const STORAGE_KEY_SETTINGS = 'mylibrary_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  googleClientId: '',
  authorName: '학술 연구자',
  theme: 'dark-library',
};

// 기본 초기 샘플 도서 (수학 및 공학 명저 포함)
export const INITIAL_BOOKS: Book[] = [
  {
    id: 'sample-1',
    isbn: '9788960773417',
    title: '미적분의 쓸모',
    author: '한화택',
    publisher: '더퀘스트',
    publishDate: '2021-04-20',
    coverImage: 'https://image.yes24.com/goods/99446869/XL',
    description: '인공지능, 자율주행, 우주선 항로 최적화 등 미래를 바꾼 수학적 사고의 정수. 변화를 예측하는 미분과 축적을 계산하는 적분의 원리를 흥미롭게 다룬다.',
    totalPages: 288,
    currentPage: 288,
    rating: 5,
    status: 'completed',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    category: '수학',
    tags: ['미적분', '수학모델링', '인공지능수학'],
    summaryReview: '미적분이 단순한 입시 수식이 아니라 현실 세계의 동역학계를 모델링하는 가장 강력한 언어임을 보여주는 책. 내가 집필할 공학수학 입문서의 서론 구성에 큰 영감을 주었다.',
    notes: [
      {
        id: 'note-1',
        chapter: '제2장 변화를 포착하는 순간의 마법: 미분',
        page: 72,
        quote: '순간변화율이란 극한의 관점에서 0으로 수렴하는 시간 간격 동안의 변화량의 비이다.',
        thought: '최적화 알고리즘(경사하강법)의 수학적 기초를 설명할 때 이 직관적 비유를 인용할 것.',
        latex: 'f\'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x}',
        createdAt: '2026-08-05T10:00:00Z',
        updatedAt: '2026-08-05T10:00:00Z',
      },
      {
        id: 'note-2',
        chapter: '제4장 유체역학과 나비에-스토크스 방정식',
        page: 184,
        quote: '유체의 연속체 가설과 운동량 보존 법칙이 결합할 때 비선형 편미분 방정식이 유도된다.',
        thought: '내 책 3장 유체역학 파트의 유도 과정과 연결할 것.',
        latex: '\\rho \\left( \\frac{\\partial \\mathbf{u}}{\\partial t} + \\mathbf{u} \\cdot \\nabla \\mathbf{u} \\right) = -\\nabla p + \\mu \\nabla^2 \\mathbf{u} + \\mathbf{f}',
        createdAt: '2026-08-10T14:30:00Z',
        updatedAt: '2026-08-10T14:30:00Z',
      }
    ],
    aiChatHistory: [
      {
        id: 'msg-1',
        role: 'user',
        content: '이 책에서 다룬 미분방정식의 개념을 컴퓨터 그래픽스와 렌더링 방정식(Rendering Equation)에 어떻게 연결할 수 있을까요?',
        timestamp: '2026-08-12T16:00:00Z'
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: '컴퓨터 그래픽스의 광선 추적(Ray Tracing)은 카지야의 렌더링 방정식(Rendering Equation)을 기반으로 합니다.\n\n$$L_o(\\mathbf{x}, \\omega_o) = L_e(\\mathbf{x}, \\omega_o) + \\int_{\\Omega} f_r(\\mathbf{x}, \\omega_i, \\omega_o) L_i(\\mathbf{x}, \\omega_i) (\\omega_i \\cdot \\mathbf{n}) d\\omega_i$$\n\n이 책에서 설명한 적분의 ‘누적 효과’와 몬테카를로 적분법(Monte Carlo Integration)을 결합하면, 복잡한 반사율 분포를 근사하는 수치 해석 기법으로 자연스럽게 연결하여 집필하실 수 있습니다.',
        timestamp: '2026-08-12T16:00:45Z'
      }
    ],
    writingInsights: [
      {
        id: 'ins-1',
        title: '동역학계 모델링과 상태공간 표현식',
        concept: '연속시간 미분방정식을 이산시간 행렬 방정식으로 변환하는 이산화(Discretization) 방법론',
        summary: '복잡한 물리 현상을 계산 가능한 알고리즘으로 변환하기 위한 필수 교두보. 테일러 전개와 오일러 방법론을 통해 수치 안정성을 분석한다.',
        latexFormula: '\\mathbf{x}_{k+1} = \\mathbf{A}\\mathbf{x}_k + \\mathbf{B}\\mathbf{u}_k + \\mathbf{w}_k',
        myApplication: '집필 중인 도서 [공학 시스템 모델링] 2장 3절의 상태공간 모델 예제 도입부로 배치할 예정.',
        originalQuote: '현실의 연속적인 흐름을 컴퓨터가 이해하는 디지털 숫자로 바꾸려면 미분을 차분으로 근사해야 한다.',
        sourceChapter: '제3장 예측의 도구: 미분방정식',
        tags: ['수학모델링', '제어공학', '상태공간'],
        createdAt: '2026-08-14T09:20:00Z'
      }
    ],
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-15T18:00:00Z'
  },
  {
    id: 'sample-2',
    isbn: '9788983711892',
    title: '파인만의 물리학 강의 1',
    author: '리처드 파인만',
    publisher: '승산',
    publishDate: '2004-04-10',
    coverImage: 'https://image.yes24.com/goods/1475713/XL',
    description: '물리학의 거장 리처드 파인만이 학부생들에게 전달한 전설적인 역학, 전자기학 강의록. 물리적 직관과 수학적 명료함의 절정.',
    totalPages: 600,
    currentPage: 320,
    rating: 5,
    status: 'reading',
    startDate: '2026-08-20',
    category: '물리학/공학',
    tags: ['고전문학', '양자역학', '물리학'],
    summaryReview: '물리적 원리를 가장 명쾌하고 우아한 직관으로 풀어낸 기념비적 저작.',
    notes: [
      {
        id: 'note-feynman-1',
        chapter: '제19장 최소 작용의 원리',
        page: 250,
        quote: '자연은 작용(Action)이 정지점(최소값)이 되는 경로를 따라 운동한다.',
        thought: '오일러-라그랑주 방정식을 통한 역학계의 해석법 정리.',
        latex: 'S = \\int_{t_1}^{t_2} L(q, \\dot{q}, t) dt, \\quad \\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}}\\right) - \\frac{\\partial L}{\\partial q} = 0',
        createdAt: '2026-08-25T11:00:00Z',
        updatedAt: '2026-08-25T11:00:00Z'
      }
    ],
    aiChatHistory: [],
    writingInsights: [
      {
        id: 'ins-feynman-1',
        title: '변분법과 최소 작용 원리의 공학적 응용',
        concept: '최적화 문제에서 비용 함수(Cost Function)를 최소화하는 궤적 제어',
        summary: '로봇 머니퓰레이터의 에너지 최소화 궤적 생성 알고리즘에 라그랑지안 역학을 결합하는 수학적 토대.',
        latexFormula: '\\delta S = \\delta \\int_{t_0}^{t_f} \\left[ \\frac{1}{2} m \\dot{x}^2 - V(x) \\right] dt = 0',
        myApplication: '집필 도서의 [로봇 공학 및 궤적 최적화] 챕터의 핵심 이론 근거로 수록.',
        originalQuote: '빛이 최단 시간 경로를 택하듯, 모든 입자의 경로는 라그랑지안의 적분값이 극값이 되는 경로이다.',
        sourceChapter: '제19장',
        tags: ['최적화', '라그랑지안', '로봇제어'],
        createdAt: '2026-08-28T15:00:00Z'
      }
    ],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-28T15:00:00Z'
  }
];

// 레포지토리 및 시리얼라이저 인스턴스 (DIP / SRP)
export const bookRepository = new LocalStorageBookRepository();
export const backupSerializer = new JsonBackupSerializer();

export const getStoredBooks = (): Book[] => bookRepository.getAll();
export const saveBooks = (books: Book[]): void => bookRepository.saveAll(books);

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings', err);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Partial<AppSettings>): AppSettings => {
  const current = getStoredSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
  return updated;
};

// SRP 준수 백업 함수 위임
export const exportBackupData = (books: Book[], settings: AppSettings): string =>
  backupSerializer.serialize(books, settings);

export const importBackupData = (jsonString: string): { books: Book[]; settings?: Partial<AppSettings> } =>
  backupSerializer.deserialize(jsonString);
