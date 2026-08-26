'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Star, 
  Clock, 
  Trophy, 
  Bookmark, 
  Filter,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  getStoredPersonalBooks, 
  getStoredProfile, 
  deleteStoredPersonalBook, 
  updateBookReadingStatus 
} from '@/lib/db';
import { PersonalBook, PersonalProfile, ReadingStatus } from '@/lib/types';
import ReadingTree from '@/components/ReadingTree';
import AddBookModal from '@/components/AddBookModal';

export default function MyLibraryHomePage() {
  const [books, setBooks] = useState<PersonalBook[]>([]);
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'all'>('reading');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = () => {
    setBooks(getStoredPersonalBooks());
    setProfile(getStoredProfile());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteBook = (e: React.MouseEvent, bookId: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`《${title}》을(를) 내 서재에서 삭제하시겠습니까?`)) {
      deleteStoredPersonalBook(bookId);
      loadData();
    }
  };

  const handleQuickStatusChange = (e: React.MouseEvent, bookId: string, newStatus: ReadingStatus) => {
    e.preventDefault();
    e.stopPropagation();
    updateBookReadingStatus(bookId, newStatus);
    loadData();
  };

  const readingBooks = books.filter((b) => b.readingStatus === 'reading');
  const completedBooks = books.filter((b) => b.readingStatus === 'completed');
  const wishlistBooks = books.filter((b) => b.readingStatus === 'wishlist');

  const displayedBooks = books.filter((b) => {
    const matchesTab = activeTab === 'all' || b.readingStatus === activeTab;
    const matchesSearch = !searchFilter.trim() || 
      b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.author.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category)))];

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Reading Growth Tree Banner */}
      <ReadingTree profile={profile} />

      {/* 2. Top Action Bar: Search & 3-Tier Shelves */}
      <div className="space-y-4">
        
        {/* Shelf Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('reading')}
              className={`py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'reading'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-slate-50'
              }`}
            >
              <span>📖</span>
              <span>지금 읽는 중 ({readingBooks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <span>🏆</span>
              <span>완독한 서재 ({completedBooks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'wishlist'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-slate-50'
              }`}
            >
              <span>✨</span>
              <span>읽고 싶은 위시리스트 ({wishlistBooks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`py-2.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>전체 ({books.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ 새 책 등록하기</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="내 서재 도서명, 저자, 키워드 검색..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 shrink-0 font-medium">분야:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'all' ? '전체 분야' : c}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* 3. Book Cards Grid */}
      {displayedBooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-2xl">
            📖
          </div>
          <h3 className="text-base font-bold text-slate-800">해당 서재에 등록된 도서가 없습니다.</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            YES24 실시간 검색으로 소장하고 있는 책이나 읽고 싶은 책을 내 서재에 추가해 보세요!
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-block mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow transition"
          >
            + 첫 번째 책 등록하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedBooks.map((book) => {
            return (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Top: Cover & Basic Info */}
                <div>
                  
                  {/* Cover Image Container */}
                  <Link href={`/books/${book.id}`} className="block relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {book.coverEmoji || '📖'}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {book.readingStatus === 'reading' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md">
                          📖 읽는 중 ({book.progressPercent}%)
                        </span>
                      )}
                      {book.readingStatus === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md">
                          🏆 완독 ({book.completedAt})
                        </span>
                      )}
                      {book.readingStatus === 'wishlist' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-md">
                          ✨ 읽고 싶음
                        </span>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteBook(e, book.id, book.title)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow transition opacity-0 group-hover:opacity-100"
                      title="내 서재에서 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>

                  {/* Info Body */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {book.category}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {book.price ? `${book.price.toLocaleString()}원` : ''}
                      </span>
                    </div>

                    <Link href={`/books/${book.id}`} className="block group-hover:text-amber-600 transition">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {book.author} · {book.publisher}
                      </p>
                    </Link>

                    {/* Summary Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {book.summary}
                    </p>

                    {/* Tags */}
                    {book.tags && book.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {book.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <Link
                    href={`/books/${book.id}#ai-buddy`}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI 티키타카</span>
                  </Link>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1">
                    {book.readingStatus !== 'completed' && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickStatusChange(e, book.id, 'completed')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold transition flex items-center gap-1"
                        title="완독으로 변경"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>완독</span>
                      </button>
                    )}
                    {book.readingStatus === 'wishlist' && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickStatusChange(e, book.id, 'reading')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-amber-700 hover:bg-amber-50 text-[11px] font-bold transition"
                        title="지금 읽기로 변경"
                      >
                        읽기시작
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={() => {
          setIsAddModalOpen(false);
          loadData();
        }}
      />

    </div>
  );
}
