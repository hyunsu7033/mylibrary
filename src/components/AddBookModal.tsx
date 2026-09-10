'use client';

import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Sparkles, 
  Check, 
  ExternalLink, 
  PlusCircle, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  SlidersHorizontal 
} from 'lucide-react';
import { saveStoredPersonalBook } from '@/lib/db';
import { PersonalBook, ReadingStatus } from '@/lib/types';
import { Yes24Order } from '@/lib/yes24';
import confetti from 'canvas-confetti';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const SORT_OPTIONS: { label: string; value: Yes24Order; description: string }[] = [
  { label: '인기도순', value: 'SINDEX_ONLY', description: '가장 많이 팔리고 사랑받는 책' },
  { label: '정확도순', value: 'RELATION', description: '검색어와 가장 연관성 높은 책' },
  { label: '신상품순', value: 'RECENT', description: '가장 최근에 출간된 최신 도서' },
  { label: '등록일순', value: 'REG_DTS', description: '데이터베이스에 등록된 순서' },
  { label: '평점순', value: 'CONT_CNT', description: '독자 평점이 높은 명작 도서' },
  { label: '최저가순', value: 'LOW_PRICE', description: '실속 있는 알뜰 가격 도서' },
];

export default function AddBookModal({ isOpen, onClose, onAdded }: AddBookModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSort, setCurrentSort] = useState<Yes24Order>('SINDEX_ONLY');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');
  const [price, setPrice] = useState<number>(12000);
  const [coverUrl, setCoverUrl] = useState('');
  const [yes24Url, setYes24Url] = useState('');
  const [category, setCategory] = useState('문학/동화');
  const [summary, setSummary] = useState('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>('reading');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const performSearch = async (query: string, sort: Yes24Order, page: number = 1) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/books/yes24?q=${encodeURIComponent(query.trim())}&order=${sort}&page=${page}`
      );
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setSearchResults(data.items);
        setCurrentPage(data.currentPage || page);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.items.length);
      } else {
        setSearchResults([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchYES24 = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSelectedBook(null);
    performSearch(searchQuery, currentSort, 1);
  };

  const handleSortChange = (newSort: Yes24Order) => {
    setCurrentSort(newSort);
    setCurrentPage(1);
    if (searchQuery.trim()) {
      performSearch(searchQuery, newSort, 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    performSearch(searchQuery, currentSort, newPage);
  };

  const handleSelectSearchResult = (item: any) => {
    setSelectedBook(item);
    setTitle(item.title || '');
    setAuthor(item.author || '');
    setPublisher(item.publisher || '');
    setIsbn(item.isbn || item.goodsNo || '');
    setPrice(item.price || 12000);
    setCoverUrl(item.coverUrl || '');
    setYes24Url(item.yes24Url || (item.goodsNo ? `https://www.yes24.com/Product/Goods/${item.goodsNo}` : ''));
    setCategory(item.category || '문학/소설');
    setSummary(item.summary || '');
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('도서 제목을 입력해주세요.');
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newBook: PersonalBook = {
      id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      author: author.trim() || '저자 미상',
      publisher: publisher.trim() || '출판사 미상',
      publishYear: new Date().getFullYear(),
      isbn: isbn.trim() || '9788900000000',
      price: Number(price) || 12000,
      coverUrl: coverUrl.trim() || (isbn ? `https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/${isbn.trim()}.jpg` : ''),
      yes24Url: yes24Url.trim() || `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(isbn.trim() || title.trim())}`,
      category: category || '문학/소설',
      summary: summary.trim() || '나만의 서재에 등록된 소중한 도서입니다. AI 북버디와 함께 책의 의미를 탐구해보세요.',
      readingStatus,
      progressPercent: readingStatus === 'completed' ? 100 : readingStatus === 'reading' ? 10 : 0,
      startedAt: readingStatus === 'reading' ? todayStr : undefined,
      completedAt: readingStatus === 'completed' ? todayStr : undefined,
      tags: tags.length > 0 ? tags : ['내서재', '추천도서'],
      coverEmoji: '📖',
    };

    saveStoredPersonalBook(newBook);
    confetti({ particleCount: 60, spread: 70 });
    onAdded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full">
                YES24 실시간 도서 검색 엔진
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
                수만 권 실시간 정렬 & 페이지네이션 지원
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>내 서재에 새 책 등록하기</span>
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Live Search & Sort Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>YES24 실시간 도서 검색 및 스마트 정렬</span>
              </label>
              {totalCount > 0 && (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                  총 <strong className="font-bold">{totalCount.toLocaleString()}</strong>권 이상 검색됨
                </span>
              )}
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchYES24} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="도서명, 키워드, 작가명 검색 (예: 질문, 와니니, 사피엔스, 아몬드, 역행자...)"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium shadow-sm"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? '검색 중...' : '검색'}</span>
              </button>
            </form>

            {/* Sorting Tabs / Chips */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>정렬 기준 선택:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSortChange(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      currentSort === opt.value
                        ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                    title={opt.description}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results List */}
            {searchResults.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                  <span>
                    검색 결과 ({searchResults.length}권 표시됨) · 도서를 클릭하면 아래 폼에 자동 입력됩니다:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isSearching}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      title="이전 페이지"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-amber-800 px-1.5 font-mono">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages || isSearching}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      title="다음 페이지"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.id || item.goodsNo}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition ${
                        selectedBook?.id === item.id || selectedBook?.goodsNo === item.goodsNo
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                          : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      {item.coverUrl ? (
                        <img 
                          src={item.coverUrl} 
                          alt={item.title} 
                          className="w-11 h-15 object-cover rounded shadow-sm shrink-0 border border-slate-100" 
                        />
                      ) : (
                        <div className="w-11 h-15 rounded bg-amber-100 flex items-center justify-center text-base shrink-0">
                          📖
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.author} · {item.publisher}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-amber-700">
                            {item.price ? `${item.price.toLocaleString()}원` : ''}
                          </span>
                          {item.rating && (
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold bg-amber-100/60 px-1.5 py-0.2 rounded">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {item.rating}
                            </span>
                          )}
                          {item.pubDate && (
                            <span className="text-[10px] text-slate-400">
                              {item.pubDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Bottom Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200/80">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isSearching}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> 이전 24권
                    </button>
                    <span className="text-xs font-bold text-slate-700 font-mono px-2">
                      페이지 {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages || isSearching}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
                    >
                      다음 24권 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {hasSearched && !isSearching && searchResults.length === 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 p-3 bg-amber-50/60 rounded-xl text-xs text-amber-900 border border-amber-200">
                🔍 일치하는 도서 목록을 찾지 못했습니다. 다른 키워드로 검색하시거나, 아래 입력란에 책 정보를 직접 입력하실 수 있습니다.
              </div>
            )}
          </div>

          {/* Book Details Form */}
          <form id="book-form" onSubmit={handleSaveBook} className="space-y-4 pt-1">
            
            {/* Reading Status Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                📚 내 서재 등록 상태 선택 *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReadingStatus('reading')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                    readingStatus === 'reading'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>📖</span> 지금 읽는 중
                </button>

                <button
                  type="button"
                  onClick={() => setReadingStatus('completed')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                    readingStatus === 'completed'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>🏆</span> 완독 완료
                </button>

                <button
                  type="button"
                  onClick={() => setReadingStatus('wishlist')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                    readingStatus === 'wishlist'
                      ? 'border-purple-500 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>✨</span> 읽고 싶은 책
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">도서 제목 *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 질문하는 과학 상자"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">저자</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="예: 저자명"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">출판사</label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="예: 출판사명"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">도서/상품번호 (ISBN)</label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="예: 9788936442804 또는 상품번호"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">정가 (원)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="15000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="문학/동화">문학/동화</option>
                  <option value="문학/소설">문학/소설</option>
                  <option value="과학/우주">과학/우주</option>
                  <option value="철학/인성">철학/인성</option>
                  <option value="역사/사회">역사/사회</option>
                  <option value="경제/경영">경제/경영</option>
                  <option value="판타지/모험">판타지/모험</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">줄거리 및 책 안내</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="책의 핵심 줄거리나 기억하고 싶은 내용을 적어주세요."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">표지 이미지 링크</label>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="과학, 인체, 베스트셀러"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {yes24Url && (
              <div className="pt-1">
                <a 
                  href={yes24Url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[11px] text-amber-700 hover:text-amber-800 underline inline-flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>YES24 공식 상품 상세페이지 보기</span>
                </a>
              </div>
            )}

          </form>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            취소
          </button>
          <button
            type="submit"
            form="book-form"
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>내 서재에 저장 완료</span>
          </button>
        </div>

      </div>
    </div>
  );
}
