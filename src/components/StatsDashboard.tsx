import type { FC } from 'react';
import type { Book } from '../types/book';
import { BookOpen, Lightbulb, Sparkles, FileText, Award, BarChart2 } from 'lucide-react';

interface StatsDashboardProps {
  books: Book[];
}

export const StatsDashboard: FC<StatsDashboardProps> = ({ books }) => {
  const totalBooks = books.length;
  const completedBooks = books.filter((b) => b.status === 'completed').length;
  const readingBooks = books.filter((b) => b.status === 'reading').length;
  const wishlistBooks = books.filter((b) => b.status === 'wishlist').length;

  const totalNotes = books.reduce((acc, b) => acc + (b.notes?.length || 0), 0);
  const totalInsights = books.reduce((acc, b) => acc + (b.writingInsights?.length || 0), 0);
  const totalAiChats = books.reduce(
    (acc, b) => acc + (b.aiChatHistory ? Math.floor(b.aiChatHistory.length / 2) : 0),
    0
  );

  // 카테고리별 도서 수 집계
  const categoryCounts = books.reduce<Record<string, number>>((acc, b) => {
    const cat = b.category || '기타';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="stats-dashboard space-y-6 mb-8">
      {/* 핵심 지표 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">내 서재 도서</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-100 mt-2">{totalBooks}권</p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-400">
            <span className="text-emerald-400">완독 {completedBooks}</span> · 
            <span className="text-amber-400">읽는 중 {readingBooks}</span>
          </div>
        </div>

        <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">독서 메모 & 구절</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-100 mt-2">{totalNotes}개</p>
          <p className="mt-2 text-[11px] text-stone-400">수학/공학 수식 포함</p>
        </div>

        <div className="p-4 bg-stone-900/80 border border-amber-500/30 rounded-xl relative overflow-hidden bg-gradient-to-br from-amber-950/20 to-stone-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">💡 집필용 인사이트</span>
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-amber-200 mt-2">{totalInsights}개</p>
          <p className="mt-2 text-[11px] text-amber-400/80">저술용 아이디어 축적됨</p>
        </div>

        <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">AI 심층 대화</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-100 mt-2">{totalAiChats}회</p>
          <p className="mt-2 text-[11px] text-stone-400">학술 토론 및 논점 분석</p>
        </div>
      </div>

      {/* 카테고리별 독서 분포 & 독서 진행 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 카테고리 분포 */}
        <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl md:col-span-2">
          <h3 className="text-xs font-serif font-bold text-stone-300 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-amber-400" /> 학술 분야 및 카테고리 분포
          </h3>
          <div className="space-y-2">
            {categories.map(([cat, count]) => {
              const percent = Math.round((count / totalBooks) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-300">
                    <span className="font-medium">{cat}</span>
                    <span className="text-stone-400">{count}권 ({percent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 독서 완독률 성과 */}
        <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-serif font-bold text-stone-300 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> 완독 달성률
            </h3>
            <p className="text-xs text-stone-400">
              서재에 등록된 도서 중 {completedBooks}권을 완독했습니다.
            </p>
          </div>

          <div className="py-4 text-center">
            <div className="text-3xl font-serif font-bold text-amber-300">
              {totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0}%
            </div>
            <p className="text-[11px] text-stone-400 mt-1">완독 전환율</p>
          </div>

          <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 flex justify-between">
            <span>위시리스트: {wishlistBooks}권</span>
            <span>진행 중: {readingBooks}권</span>
          </div>
        </div>
      </div>
    </div>
  );
};
