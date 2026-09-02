import type { FC } from 'react';
import type { Book } from '../types/book';
import { BookOpen, CheckCircle, Clock, Sparkles, FileText, Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export const BookCard: FC<BookCardProps> = ({ book, onClick }) => {
  const progressPercent = book.totalPages && book.currentPage
    ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))
    : (book.status === 'completed' ? 100 : 0);

  const getStatusBadge = () => {
    switch (book.status) {
      case 'completed':
        return (
          <span className="badge badge-completed flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> 완독
          </span>
        );
      case 'reading':
        return (
          <span className="badge badge-reading flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-amber-400" /> 읽는 중
          </span>
        );
      case 'wishlist':
        return (
          <span className="badge badge-wishlist flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" /> 읽고 싶은 책
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className="book-card group cursor-pointer relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl"
    >
      {/* 3D 책 커버 영역 */}
      <div className="book-cover-container relative aspect-[3/4] w-full overflow-hidden bg-stone-900">
        <img
          src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
          alt={book.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // 이미지 깨짐 방지
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
          }}
        />
        
        {/* 오버레이 그라데이션 및 상태 */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        {/* 상단 뱃지 */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center z-10">
          <span className="category-tag text-[11px] px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md text-amber-300/90 border border-amber-500/20 font-medium">
            {book.category || '수학/공학'}
          </span>
          {getStatusBadge()}
        </div>

        {/* 하단 책 정보 오버레이 */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col gap-1">
          {book.rating && book.rating > 0 && (
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < (book.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`}
                />
              ))}
            </div>
          )}

          {/* 진행률 바 */}
          {book.status === 'reading' && book.totalPages && (
            <div className="w-full mt-1">
              <div className="flex justify-between text-[10px] text-stone-400 mb-0.5">
                <span>{book.currentPage || 0} / {book.totalPages}p</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 책 메타데이터 영역 */}
      <div className="book-card-info p-3.5 flex flex-col flex-grow bg-stone-900/90 border border-t-0 border-stone-800/80 rounded-b-xl">
        <h3 className="font-serif font-bold text-stone-100 text-base line-clamp-1 group-hover:text-amber-300 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
          {book.author} · {book.publisher}
        </p>

        {/* 축적된 독서록/AI대화/집필 인사이트 배지 카운트 */}
        <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="독서 메모">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>{book.notes?.length || 0}</span>
            </span>
            <span className="flex items-center gap-1" title="AI 심층 토론">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
              <span>{book.aiChatHistory?.length ? Math.floor(book.aiChatHistory.length / 2) : 0}</span>
            </span>
          </div>

          {book.writingInsights && book.writingInsights.length > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[10px] font-medium">
              💡 집필노트 {book.writingInsights.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
