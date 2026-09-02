import { useState, useEffect } from 'react';
import type { Book, AppSettings } from './types/book';
import { getStoredBooks, saveBooks, getStoredSettings, saveSettings } from './services/storage';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { BookshelfView } from './components/BookshelfView';
import { BookDetailModal } from './components/BookDetailModal';
import { BookSearchModal } from './components/BookSearchModal';
import { GoogleDriveBackupModal } from './components/GoogleDriveBackupModal';
import { SettingsModal } from './components/SettingsModal';
import confetti from 'canvas-confetti';

export function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // 모달 열림 상태
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 초기 도서 목록 로드
  useEffect(() => {
    const loaded = getStoredBooks();
    setBooks(loaded);
    setSettings(getStoredSettings());
  }, []);

  // 도서 목록 변경 시 로컬 스토리지에 자동 저장
  const handleUpdateBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    saveBooks(newBooks);
  };

  // 새 도서 추가
  const handleAddBook = (newBook: Book) => {
    const updated = [newBook, ...books];
    handleUpdateBooks(updated);
    setSelectedBook(newBook); // 추가 후 바로 상세 모달 열기
  };

  // 기존 도서 업데이트 (독서 메모, AI 대화, 집필 인사이트 등)
  const handleUpdateSingleBook = (updatedBook: Book) => {
    // 완독 상태로 변경 시 축하 파티클 효과
    const previous = books.find((b) => b.id === updatedBook.id);
    if (previous && previous.status !== 'completed' && updatedBook.status === 'completed') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#d97706', '#10b981', '#38bdf8'],
        });
      } catch (e) {}
    }

    const updated = books.map((b) => (b.id === updatedBook.id ? updatedBook : b));
    handleUpdateBooks(updated);
    setSelectedBook(updatedBook);
  };

  // 도서 삭제
  const handleDeleteBook = (id: string) => {
    const updated = books.filter((b) => b.id !== id);
    handleUpdateBooks(updated);
    setSelectedBook(null);
  };

  // 백업에서 도서 복원
  const handleRestoreBooks = (restoredBooks: Book[], restoredSettings?: Partial<AppSettings>) => {
    handleUpdateBooks(restoredBooks);
    if (restoredSettings) {
      const newSettings = saveSettings(restoredSettings);
      setSettings(newSettings);
    }
  };

  // 설정 저장
  const handleSaveSettings = (newSettings: Partial<AppSettings>) => {
    const updated = saveSettings(newSettings);
    setSettings(updated);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* 상단 헤더 */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddBook={() => setIsSearchModalOpen(true)}
        onOpenDriveBackup={() => setIsDriveModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        showStats={showStats}
        onToggleStats={() => setShowStats(!showStats)}
        authorName={settings.authorName || '학술 연구자'}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {/* 통계 대시보드 (토글형) */}
        {showStats && <StatsDashboard books={books} />}

        {/* 책장 선반 / 그리드 / 리스트 뷰 */}
        <BookshelfView
          books={books}
          searchQuery={searchQuery}
          onSelectBook={(book) => setSelectedBook(book)}
          onOpenAddBook={() => setIsSearchModalOpen(true)}
        />
      </main>

      {/* 푸터 */}
      <footer className="mt-auto py-6 border-t border-stone-800/60 bg-stone-950/80 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            📚 My Scholar Library & Idea Vault — 수학·공학 LaTeX 수식 & YES24 & AI 심층 토론 지원
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>총 {books.length}권의 소장 도서</span>
            <span>·</span>
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Google Drive 동기화
            </button>
          </div>
        </div>
      </footer>

      {/* 1. 도서 상세 및 독서록/AI토론/집필인사이트 모달 */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          apiKey={settings.geminiApiKey}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdateBook={handleUpdateSingleBook}
          onDeleteBook={handleDeleteBook}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
      )}

      {/* 2. YES24 도서 검색 및 추가 모달 */}
      <BookSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAddBook={handleAddBook}
      />

      {/* 3. Google Drive 백업 및 복원 모달 */}
      <GoogleDriveBackupModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        books={books}
        settings={settings}
        onRestoreBooks={handleRestoreBooks}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 4. 환경 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}

export default App;
