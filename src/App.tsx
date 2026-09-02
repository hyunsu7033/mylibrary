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
import { CheckCircle2 } from 'lucide-react';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 초기 도서 목록 로드
  useEffect(() => {
    const loaded = getStoredBooks();
    setBooks(loaded);
    setSettings(getStoredSettings());
  }, []);

  // 토스트 메시지 헬퍼
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 도서 목록 변경 시 로컬 스토리지에 자동 저장
  const handleUpdateBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    saveBooks(newBooks);
  };

  // 새 도서 추가
  const handleAddBook = (newBook: Book) => {
    const updated = [newBook, ...books];
    handleUpdateBooks(updated);
    
    // 축하 파티클 효과
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#d97706', '#10b981', '#38bdf8'],
      });
    } catch (e) {}

    showToast(`📚 《${newBook.title}》 도서가 내 서재에 성공적으로 추가되었습니다!`);
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
      showToast(`🎉 축하합니다! 《${updatedBook.title}》을(를) 완독하셨습니다!`);
    }

    const updated = books.map((b) => (b.id === updatedBook.id ? updatedBook : b));
    handleUpdateBooks(updated);
    setSelectedBook(updatedBook);
  };

  // 도서 삭제
  const handleDeleteBook = (id: string) => {
    const target = books.find((b) => b.id === id);
    const updated = books.filter((b) => b.id !== id);
    handleUpdateBooks(updated);
    setSelectedBook(null);
    if (target) {
      showToast(`🗑️ 《${target.title}》 도서가 삭제되었습니다.`);
    }
  };

  // 백업에서 도서 복원
  const handleRestoreBooks = (restoredBooks: Book[], restoredSettings?: Partial<AppSettings>) => {
    handleUpdateBooks(restoredBooks);
    if (restoredSettings) {
      const merged = { ...settings, ...restoredSettings };
      setSettings(merged);
      saveSettings(merged);
    }
    showToast(`☁️ Google Drive에서 ${restoredBooks.length}권의 도서 데이터를 성공적으로 복원했습니다!`);
  };

  // 설정 저장
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast('⚙️ 설정이 안전하게 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 플로팅 토스트 알림 */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 bg-stone-900/95 border border-amber-500/40 text-stone-100 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 헤더 */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddBook={() => setIsSearchModalOpen(true)}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        showStats={showStats}
        onToggleStats={() => setShowStats(!showStats)}
        bookCount={books.length}
      />

      {/* 통계 대시보드 (토글) */}
      {showStats && (
        <div className="border-b border-stone-800 bg-stone-950/40 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <StatsDashboard books={books} />
          </div>
        </div>
      )}

      {/* 메인 서재 뷰 */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookshelfView
          books={books}
          searchQuery={searchQuery}
          onSelectBook={(book) => setSelectedBook(book)}
          onOpenAddBook={() => setIsSearchModalOpen(true)}
        />
      </main>

      {/* 푸터 */}
      <footer className="border-t border-stone-800/80 bg-stone-950/80 py-6 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-serif">
            My Scholar Library &middot; 독서와 학술 집필을 위한 프라이빗 워크스페이스
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>총 {books.length}권의 소장 도서</span>
            <span>·</span>
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
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
