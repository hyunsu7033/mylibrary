import React from 'react';
import { BookOpen, Plus, Cloud, BarChart3, Settings, Search, Sparkles } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddBook: () => void;
  onOpenDriveBackup: () => void;
  onOpenSettings: () => void;
  showStats: boolean;
  onToggleStats: () => void;
  authorName: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddBook,
  onOpenDriveBackup,
  onOpenSettings,
  showStats,
  onToggleStats,
  authorName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        {/* 로고 & 서재 타이틀 */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-950/60 border border-amber-400/30">
              <BookOpen className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-serif font-black tracking-tight text-stone-100">
                  MY SCHOLAR LIBRARY
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono border border-amber-800/60">
                  LaTeX & AI
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">
                {authorName}의 개인 서재 & 집필용 독서 기록
              </p>
            </div>
          </div>

          {/* 모바일용 액션 버튼 모음 */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenDriveBackup}
              className="p-2 text-stone-300 hover:text-amber-400 bg-stone-900 border border-stone-800 rounded-lg"
              title="Google Drive 백업"
            >
              <Cloud className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 text-stone-300 hover:text-amber-400 bg-stone-900 border border-stone-800 rounded-lg"
              title="설정"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 중앙 검색창 */}
        <div className="w-full md:max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="도서명, 저자, 수학 수식, 집필 아이디어 검색..."
            className="w-full pl-10 pr-4 py-2 bg-stone-900/90 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-xs md:text-sm focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        {/* 우측 메인 액션 버튼 */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onToggleStats}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showStats
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>독서 통계</span>
          </button>

          <button
            onClick={onOpenDriveBackup}
            className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-medium border border-stone-800 hover:border-stone-700 transition-colors flex items-center gap-1.5"
            title="Google Drive 백업 및 복원"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Drive 백업/복원</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 rounded-xl border border-stone-800 transition-colors"
            title="설정"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddBook}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-950/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-stone-950 stroke-[3]" />
            <span>YES24 책 추가</span>
          </button>
        </div>
      </div>
    </header>
  );
};
