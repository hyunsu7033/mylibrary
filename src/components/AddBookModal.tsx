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
  Tag
} from 'lucide-react';
import { saveStoredPersonalBook } from '@/lib/db';
import { PersonalBook, ReadingStatus } from '@/lib/types';
import confetti from 'canvas-confetti';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddBookModal({ isOpen, onClose, onAdded }: AddBookModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearchYES24 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);
    setSelectedBook(null);

    try {
      const res = await fetch(`/api/books/yes24?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setSearchResults(data.items);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    setSelectedBook(item);
    setTitle(item.title || '');
    setAuthor(item.author || '');
    setPublisher(item.publisher || '');
    setIsbn(item.isbn || '');
    setPrice(item.price || 12000);
    setCoverUrl(item.coverUrl || '');
    setYes24Url(item.yes24Url || (item.isbn ? `https://www.yes24.com/Product/Search?domain=BOOK&query=${item.isbn}` : ''));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-full">
              국내외 도서 실시간 연동
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-600" />
              <span>내 서재에 새 책 등록하기</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Live Search Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <label className="block font-bold text-slate-800 text-xs">
              🔍 실시간 도서 검색 (국내도서 · 외서 · 원서 검색 가능)
            </label>
            <form onSubmit={handleSearchYES24} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="책 제목, 저자, 영문 원서명 (예: We Are As Gods, 사피엔스, 와니니, 돈의 속성...)"
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? '검색 중...' : '도서 검색'}</span>
              </button>
            </form>

            {/* Search Results List */}
            {searchResults.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  검색 결과 ({searchResults.length}권) - 클릭 시 서지정보가 자동으로 채워집니다:
                </span>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition ${
                        selectedBook?.id === item.id
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                          : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt={item.title} className="w-9 h-12 object-cover rounded shadow-sm shrink-0" />
                      ) : (
                        <div className="w-9 h-12 rounded bg-amber-100 flex items-center justify-center text-sm shrink-0">📖</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.author} · {item.publisher}</div>
                        <div className="text-[10px] text-amber-700 font-mono font-bold mt-0.5">
                          ISBN: {item.isbn || '확인중'} · {item.price ? `${item.price.toLocaleString()}원` : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSearched && !isSearching && searchResults.length === 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 p-3 bg-amber-50/60 rounded-xl text-xs text-amber-900 border border-amber-200">
                🔍 일치하는 도서 목록을 찾지 못했습니다. 아래 도서 정보 입력칸에 책 제목을 직접 입력하여 등록하실 수 있습니다.
              </div>
            )}
          </div>

          {/* Book Details Form */}
          <form id="book-form" onSubmit={handleSaveBook} className="space-y-4">
            
            {/* Reading Status Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                📚 내 서재 등록 상태 선택 *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReadingStatus('reading')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1 ${
                    readingStatus === 'reading'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>📖</span> 지금 읽는 중
                </button>

                <button
                  type="button"
                  onClick={() => setReadingStatus('completed')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1 ${
                    readingStatus === 'completed'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>🏆</span> 완독 완료
                </button>

                <button
                  type="button"
                  onClick={() => setReadingStatus('wishlist')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1 ${
                    readingStatus === 'wishlist'
                      ? 'border-purple-500 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20'
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
                  placeholder="예: 푸른 사자 와니니"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">저자</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="예: 이현 글 / 오윤화 그림"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">출판사</label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="예: 창비"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ISBN (13자리)</label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="9788936442804"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">정가 (원)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="10800"
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="성장, 감동, 우정, 모험"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

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
