'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Trophy, 
  BookOpen, 
  Calendar, 
  Star, 
  Sparkles, 
  Award, 
  TrendingUp 
} from 'lucide-react';
import { getStoredPersonalBooks, getStoredProfile, getStoredThoughts } from '@/lib/db';
import { PersonalBook, PersonalProfile, SavedThought } from '@/lib/types';
import ReadingTree from '@/components/ReadingTree';

export default function StatsPage() {
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [books, setBooks] = useState<PersonalBook[]>([]);
  const [thoughts, setThoughts] = useState<SavedThought[]>([]);

  useEffect(() => {
    setProfile(getStoredProfile());
    setBooks(getStoredPersonalBooks());
    setThoughts(getStoredThoughts());
  }, []);

  if (!profile) return null;

  const completedBooks = books.filter((b) => b.readingStatus === 'completed');
  const readingBooks = books.filter((b) => b.readingStatus === 'reading');
  const wishlistBooks = books.filter((b) => b.readingStatus === 'wishlist');

  // Category Breakdown
  const categoryCounts: Record<string, number> = {};
  completedBooks.forEach((b) => {
    categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-amber-500" />
            <span>나의 독서 성장 리포트 & 통계</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {profile.ownerName} 님의 독서 기록과 지혜의 성장 지표입니다.
          </p>
        </div>
      </div>

      {/* Reading Tree */}
      <ReadingTree profile={profile} />

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1">
          <div className="text-2xl">🏆</div>
          <div className="text-[11px] font-bold text-slate-500">완독 도서</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {completedBooks.length} <span className="text-xs text-slate-400 font-normal">권</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1">
          <div className="text-2xl">📖</div>
          <div className="text-[11px] font-bold text-slate-500">읽는 중</div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {readingBooks.length} <span className="text-xs text-slate-400 font-normal">권</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1">
          <div className="text-2xl">⭐</div>
          <div className="text-[11px] font-bold text-slate-500">AI 생각노트</div>
          <div className="text-xl sm:text-2xl font-black text-cosmic-600">
            {thoughts.length} <span className="text-xs text-slate-400 font-normal">개</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1">
          <div className="text-2xl">✨</div>
          <div className="text-[11px] font-bold text-slate-500">독서 포인트</div>
          <div className="text-xl sm:text-2xl font-black text-orange-600">
            {profile.readingPoints} <span className="text-xs text-slate-400 font-normal">P</span>
          </div>
        </div>

      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <span>완독 분야별 독서 분포</span>
        </h3>

        {Object.keys(categoryCounts).length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            아직 완독된 도서가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / completedBooks.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{cat}</span>
                    <span>{count}권 ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Books Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-500" />
          <span>명예의 전당 (완독 도서 목록)</span>
        </h3>

        {completedBooks.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            완독한 도서가 여기에 명예롭게 기록됩니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedBooks.map((b) => (
              <Link
                key={b.id}
                href={`/books/${b.id}`}
                className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition flex items-center gap-3 group"
              >
                {b.coverUrl ? (
                  <img src={b.coverUrl} alt={b.title} className="w-12 h-16 object-cover rounded shadow-sm shrink-0" />
                ) : (
                  <div className="w-12 h-16 rounded bg-amber-100 flex items-center justify-center text-lg shrink-0">📖</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-black text-slate-900 text-xs sm:text-sm truncate group-hover:text-amber-600 transition">
                    {b.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {b.author}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      완독일: {b.completedAt || '기록됨'}
                    </span>
                    {b.rating && (
                      <span className="text-[10px] text-amber-500 font-bold flex items-center">
                        ⭐ {b.rating}.0
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
