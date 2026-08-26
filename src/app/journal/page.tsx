'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bookmark, 
  Calendar, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { getStoredThoughts, deleteStoredThought } from '@/lib/db';
import { SavedThought } from '@/lib/types';

export default function JournalPage() {
  const [thoughts, setThoughts] = useState<SavedThought[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setThoughts(getStoredThoughts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`《${title}》 관련 AI 대화 노트를 휴지통에 버리시겠습니까?`)) {
      deleteStoredThought(id);
      loadData();
      setToastMessage('대화 노트가 안전하게 삭제되었습니다.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('대화 내용이 클립보드에 복사되었습니다! 📋');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-amber-500 fill-amber-500" />
            <span>나만의 AI 심층 생각노트</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            책을 읽으며 AI 북버디와 나눈 지적 티키타카와 깨달음이 <strong>날짜와 시간(초 단위)</strong>과 함께 보관됩니다.
          </p>
        </div>

        <div className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 shrink-0 self-start sm:self-auto">
          총 {thoughts.length}개의 생각 보관 중
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Thoughts List */}
      {thoughts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-2xl">
            ⭐
          </div>
          <h3 className="text-base font-bold text-slate-800">아직 저장된 AI 독서 생각이 없습니다.</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            도서 상세 페이지의 <strong>[1:1 AI 심층 티키타카]</strong>에서 마음에 드는 AI의 답변 말풍선 아래 <strong>[⭐ 생각노트에 저장]</strong> 버튼을 누르면 이곳에 날짜/시간과 함께 자동으로 모입니다!
          </p>
          <Link
            href="/"
            className="inline-block mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow hover:brightness-110 transition"
          >
            내 서재 도서 읽으러 가기 🚀
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {thoughts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Card Header: Book Info & Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  {item.bookCoverUrl ? (
                    <img
                      src={item.bookCoverUrl}
                      alt={item.bookTitle}
                      className="w-10 h-14 object-cover rounded-lg shadow-sm border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-amber-100 flex items-center justify-center text-lg shrink-0">
                      📖
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                      {item.category || '문학'}
                    </span>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base mt-0.5">
                      {item.bookTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>기록: {item.savedAt}</span>
                  </span>
                </div>
              </div>

              {/* Dialogue Content */}
              <div className="space-y-3 text-xs sm:text-sm">
                {/* User Prompt */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    Q
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-700 block mb-0.5 text-xs">내가 던진 생각 질문:</span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {item.userQuestion}
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 p-5 rounded-2xl border border-amber-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-cosmic-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    AI
                  </span>
                  <div className="flex-1 space-y-1">
                    <span className="font-bold text-cosmic-800 block text-xs">AI 북버디 루카의 심층 해설:</span>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {item.aiResponse}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/books/${item.bookId}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 font-bold text-slate-600 transition flex items-center gap-1"
                  >
                    <span>이 책 펼치기</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleCopy(`[도서] ${item.bookTitle}\n[질문] ${item.userQuestion}\n[AI 답변] ${item.aiResponse}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>복사하기</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.bookTitle)}
                  className="px-3.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition flex items-center gap-1 border border-rose-200 hover:border-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>휴지통에 버리기</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
