'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  ExternalLink, 
  ShoppingCart, 
  Star, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  BookOpen,
  Share2
} from 'lucide-react';
import { 
  getStoredPersonalBooks, 
  updateBookReadingStatus, 
  deleteStoredPersonalBook 
} from '@/lib/db';
import { PersonalBook, ReadingStatus } from '@/lib/types';
import AIChatBot from '@/components/AIChatBot';
import confetti from 'canvas-confetti';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<PersonalBook | null>(null);

  // Review & Rating State
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadBook = () => {
    const list = getStoredPersonalBooks();
    const found = list.find((b) => b.id === params.id);
    if (found) {
      setBook(found);
      setRating(found.rating || 5);
      setReviewText(found.reviewText || '');
    }
  };

  useEffect(() => {
    loadBook();
  }, [params.id]);

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">도서를 찾을 수 없습니다.</h2>
        <Link href="/" className="inline-block px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-xs">
          내 서재로 돌아가기
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: ReadingStatus) => {
    const updated = updateBookReadingStatus(book.id, newStatus, {
      rating,
      reviewText,
    });
    if (updated) {
      setBook(updated);
      confetti({ particleCount: 50, spread: 60 });
      setToastMessage(newStatus === 'completed' ? '🎉 완독이 기록되었습니다! (+50 독서포인트)' : '독서 상태가 변경되었습니다.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateBookReadingStatus(book.id, 'completed', {
      rating,
      reviewText,
    });
    if (updated) {
      setBook(updated);
      confetti({ particleCount: 60, spread: 70 });
      setToastMessage('⭐ 독서 감상평과 별점이 내 서재에 안전하게 저장되었습니다!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDeleteBook = () => {
    if (confirm(`《${book.title}》을(를) 내 서재에서 완전히 삭제하시겠습니까?`)) {
      deleteStoredPersonalBook(book.id);
      router.push('/');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-700 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>내 서재로 돌아가기</span>
        </Link>

        <button
          type="button"
          onClick={handleDeleteBook}
          className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>내 서재에서 삭제</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Book Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Cover Column (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative group">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {book.coverEmoji || '📖'}
              </div>
            )}
          </div>

          {/* YES24 Direct Buy Link */}
          {book.yes24Url && (
            <a
              href={book.yes24Url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span>YES24에서 이 책 구입하기 ({book.price ? `${book.price.toLocaleString()}원` : ''})</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}
        </div>

        {/* Info Column (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {book.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ISBN: {book.isbn}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {book.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
              {book.author} 저 · {book.publisher} 출판 · {book.publishYear}년
            </p>
          </div>

          {/* Reading Status Selector Buttons */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">내 독서 상태:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('reading')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  book.readingStatus === 'reading'
                    ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>📖</span> 지금 읽는 중
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('completed')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  book.readingStatus === 'completed'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🏆</span> 완독 완료
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('wishlist')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  book.readingStatus === 'wishlist'
                    ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>✨</span> 위시리스트
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800">줄거리 및 도서 안내</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/30 p-4 rounded-2xl border border-amber-100 whitespace-pre-wrap">
              {book.summary}
            </p>
          </div>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.map((tag) => (
                <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* 1:1 AI BookBuddy Section */}
      <section id="ai-buddy" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>《{book.title}》 1:1 AI 심층 티키타카</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              책 속 인물의 심리와 갈등, 만약 나라면? 가상 토론을 자유롭게 나누고 생각노트에 스크랩하세요.
            </p>
          </div>
        </div>

        <AIChatBot book={book} />
      </section>

      {/* Review & Personal Note Form */}
      <section className="space-y-4 pt-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>나만의 완독 감상평 & 독서 기록</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            이 책을 읽고 기억하고 싶은 생각이나 깨달음을 남겨보세요.
          </p>
        </div>

        <form onSubmit={handleSaveReview} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">별점 평가:</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder={`《${book.title}》을 읽고 가장 마음에 남는 장면이나 내 생각의 변화를 기록해보세요...`}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>완독 감상평 저장하기</span>
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}
