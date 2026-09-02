import { useState } from 'react';
import type { FormEvent, FC } from 'react';
import { searchYes24Books, convertSearchResultToBook } from '../services/yes24';
import type { Yes24SearchResult } from '../services/yes24';
import type { Book, ReadingStatus } from '../types/book';
import { Search, Plus, BookOpen, X, Loader2, Edit3 } from 'lucide-react';

interface BookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Book) => void;
}

export const BookSearchModal: FC<BookSearchModalProps> = ({
  isOpen,
  onClose,
  onAddBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Yes24SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'yes24' | 'manual'>('yes24');

  // 직접 등록 폼 상태
  const [manualForm, setManualForm] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    category: '수학/공학',
    totalPages: 300,
    coverImage: '',
    description: '',
    status: 'reading' as ReadingStatus,
  });

  if (!isOpen) return null;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchYes24Books(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (
    result: Yes24SearchResult,
    status: ReadingStatus = 'reading',
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newBook = convertSearchResultToBook(result);
    newBook.status = status;
    onAddBook(newBook);
    onClose();
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manualForm.title.trim()) return;

    const now = new Date().toISOString();
    const newBook: Book = {
      id: 'book-' + Date.now(),
      title: manualForm.title,
      author: manualForm.author || '저자 미상',
      publisher: manualForm.publisher || '출판사 미상',
      isbn: manualForm.isbn || 'MANUAL-' + Date.now(),
      category: manualForm.category || '수학/공학',
      totalPages: Number(manualForm.totalPages) || 300,
      currentPage: 0,
      coverImage: manualForm.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      description: manualForm.description,
      status: manualForm.status,
      startDate: now.slice(0, 10),
      tags: [manualForm.category],
      notes: [],
      aiChatHistory: [],
      writingInsights: [],
      createdAt: now,
      updatedAt: now,
    };

    onAddBook(newBook);
    onClose();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="modal-container w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 모달 헤더 */}
        <div className="modal-header px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-serif font-bold text-stone-100">내 서재에 책 추가하기</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 전환 */}
        <div className="flex border-b border-stone-800 bg-stone-950/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('yes24')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'yes24'
                ? 'border-amber-400 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Search className="w-4 h-4" />
            YES24 도서 검색 (자동 표지/ISBN)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-amber-400 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            직접 도서 정보 입력
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="modal-body p-6 overflow-y-auto flex-grow">
          {activeTab === 'yes24' ? (
            <div className="flex flex-col gap-6">
              {/* 검색창 */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="도서 제목, 저자명, 또는 13자리 ISBN을 입력하세요 (예: 선형대수학, 미적분의 쓸모)"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/70 text-sm"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-semibold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
                </button>
              </form>

              {/* 검색 결과 리스트 */}
              <div className="space-y-3">
                {isSearching && (
                  <div className="py-12 flex flex-col items-center justify-center text-stone-400 gap-3">
                    <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                    <p className="text-sm">YES24에서 도서 정보와 표지를 검색하고 있습니다...</p>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="flex items-center justify-between px-1 text-xs text-stone-400">
                    <span className="font-semibold text-amber-300">검색 결과: 총 {searchResults.length}권의 도서</span>
                    <span>원하는 상태의 버튼을 눌러 서재에 담으세요</span>
                  </div>
                )}

                {!isSearching && searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-3.5 bg-stone-950/60 border border-stone-800/80 rounded-xl hover:border-amber-500/40 transition-colors group"
                  >
                    <img
                      src={item.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="w-20 h-28 object-cover rounded-lg shadow-md bg-stone-900 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <h4 className="font-serif font-bold text-stone-100 text-sm line-clamp-1 group-hover:text-amber-300">
                          {item.title}
                        </h4>
                        <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                          {item.author} · {item.publisher} {item.publishDate ? `(${item.publishDate})` : ''}
                        </p>
                        <p className="text-xs text-stone-400/80 mt-1.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        {item.isbn && (
                          <span className="inline-block mt-1 text-[10px] text-stone-400 font-mono">
                            ISBN: {item.isbn}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-900">
                        <button
                          type="button"
                          onClick={(e) => handleSelectResult(item, 'reading', e)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> 읽는 중으로 추가
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSelectResult(item, 'completed', e)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          완독으로 추가
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSelectResult(item, 'wishlist', e)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          읽고싶은 책
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 직접 입력 폼 */
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">도서 제목 *</label>
                <input
                  type="text"
                  required
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  placeholder="예: 공학도를 위한 수치해석"
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">저자</label>
                  <input
                    type="text"
                    value={manualForm.author}
                    onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
                    placeholder="저자명"
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">출판사</label>
                  <input
                    type="text"
                    value={manualForm.publisher}
                    onChange={(e) => setManualForm({ ...manualForm, publisher: e.target.value })}
                    placeholder="출판사명"
                    className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">카테고리</label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="수학">수학</option>
                    <option value="공학">공학</option>
                    <option value="물리학">물리학</option>
                    <option value="컴퓨터과학">컴퓨터과학</option>
                    <option value="인문/철학">인문/철학</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">총 페이지 수</label>
                  <input
                    type="number"
                    value={manualForm.totalPages}
                    onChange={(e) => setManualForm({ ...manualForm, totalPages: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">독서 상태</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as ReadingStatus })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="reading">읽는 중</option>
                    <option value="completed">완독</option>
                    <option value="wishlist">읽고 싶은 책</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">표지 이미지 URL (선택)</label>
                <input
                  type="text"
                  value={manualForm.coverImage}
                  onChange={(e) => setManualForm({ ...manualForm, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">책 소개 / 독서 목표</label>
                <textarea
                  rows={3}
                  value={manualForm.description}
                  onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                  placeholder="이 책을 읽는 목적이나 도서에 대한 간략한 메모를 남겨주세요."
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg text-sm hover:bg-stone-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-sm transition-colors"
                >
                  내 서재에 저장
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
