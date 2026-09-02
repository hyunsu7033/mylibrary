import { useState } from 'react';
import type { FC } from 'react';
import type { Book } from '../types/book';
import { BookCard } from './BookCard';
import {
  LayoutGrid,
  Library,
  List,
  ArrowUpDown,
  BookOpen,
  Plus,
  Star,
} from 'lucide-react';

interface BookshelfViewProps {
  books: Book[];
  searchQuery: string;
  onSelectBook: (book: Book) => void;
  onOpenAddBook: () => void;
}

export const BookshelfView: FC<BookshelfViewProps> = ({
  books,
  searchQuery,
  onSelectBook,
  onOpenAddBook,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'shelf' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'rating' | 'title' | 'insights'>('updated');

  // 검색 및 필터링 적용
  const filteredBooks = books.filter((book) => {
    // 1. 검색어 필터
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title?.toLowerCase().includes(q);
      const matchAuthor = book.author?.toLowerCase().includes(q);
      const matchCategory = book.category?.toLowerCase().includes(q);
      const matchTags = book.tags?.some((t) => t.toLowerCase().includes(q));
      const matchNotes = book.notes?.some(
        (n) => n.thought.toLowerCase().includes(q) || (n.quote && n.quote.toLowerCase().includes(q))
      );
      const matchInsights = book.writingInsights?.some(
        (i) => i.title.toLowerCase().includes(q) || i.myApplication.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchAuthor && !matchCategory && !matchTags && !matchNotes && !matchInsights) {
        return false;
      }
    }

    // 2. 상태/카테고리 탭 필터
    if (activeFilter === 'all') return true;
    if (activeFilter === 'reading') return book.status === 'reading';
    if (activeFilter === 'completed') return book.status === 'completed';
    if (activeFilter === 'wishlist') return book.status === 'wishlist';
    if (activeFilter === 'math') return book.category?.includes('수학') || book.tags?.includes('수학');
    if (activeFilter === 'engineering') return book.category?.includes('공학') || book.category?.includes('물리');
    return book.category === activeFilter;
  });

  // 정렬 적용
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'insights') {
      return (b.writingInsights?.length || 0) - (a.writingInsights?.length || 0);
    }
    // 기본: 최근 업데이트 순
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });

  const filterTabs = [
    { id: 'all', label: `전체 (${books.length})` },
    { id: 'reading', label: `읽는 중 (${books.filter((b) => b.status === 'reading').length})` },
    { id: 'completed', label: `완독 (${books.filter((b) => b.status === 'completed').length})` },
    { id: 'wishlist', label: `위시리스트 (${books.filter((b) => b.status === 'wishlist').length})` },
    { id: 'math', label: '∑ 수학' },
    { id: 'engineering', label: '⚙️ 공학/물리' },
  ];

  return (
    <div className="bookshelf-view space-y-6">
      {/* 서재 필터 바 & 뷰 전환 컨트롤 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 bg-stone-900/60 border border-stone-800/80 rounded-2xl">
        {/* 상태 및 카테고리 필터 태그 */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/30'
                  : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 우측 정렬 및 뷰 전환 */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* 정렬 드롭다운 */}
          <div className="flex items-center gap-1 text-xs text-stone-400 bg-stone-950/80 border border-stone-800 px-2.5 py-1.5 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-300 focus:outline-none cursor-pointer"
            >
              <option value="updated">최근 기록순</option>
              <option value="rating">별점 높은순</option>
              <option value="insights">집필 아이디어 많은순</option>
              <option value="title">가나다 제목순</option>
            </select>
          </div>

          {/* 뷰 모드 버튼 */}
          <div className="flex items-center gap-1 bg-stone-950/80 border border-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-stone-800 text-amber-300' : 'text-stone-500 hover:text-stone-300'
              }`}
              title="그리드 뷰"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('shelf')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'shelf' ? 'bg-stone-800 text-amber-300' : 'text-stone-500 hover:text-stone-300'
              }`}
              title="원목 선반 뷰 (Bookshelf)"
            >
              <Library className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-stone-800 text-amber-300' : 'text-stone-500 hover:text-stone-300'
              }`}
              title="리스트 뷰"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 도서 목록이 없을 때 빈 상태 안내 */}
      {sortedBooks.length === 0 && (
        <div className="py-20 text-center bg-stone-900/40 border border-dashed border-stone-800 rounded-2xl p-8">
          <BookOpen className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-stone-200">등록된 도서가 없습니다</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `"${searchQuery}"에 해당하는 책을 찾을 수 없습니다.`
              : 'YES24에서 읽은 책을 검색하여 내 서재에 추가해보세요.'}
          </p>
          <button
            onClick={onOpenAddBook}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5 shadow-lg"
          >
            <Plus className="w-4 h-4" /> 책 추가하기
          </button>
        </div>
      )}

      {/* 1. 기본 그리드 뷰 */}
      {viewMode === 'grid' && sortedBooks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {sortedBooks.map((book) => (
            <BookCard key={book.id} book={book} onClick={() => onSelectBook(book)} />
          ))}
        </div>
      )}

      {/* 2. 서재 선반 뷰 (Bookshelf) */}
      {viewMode === 'shelf' && sortedBooks.length > 0 && (
        <div className="bookshelf-wood-container space-y-10">
          {/* 선반 행으로 분할 (4권씩) */}
          {Array.from({ length: Math.ceil(sortedBooks.length / 4) }).map((_, shelfIdx) => {
            const shelfBooks = sortedBooks.slice(shelfIdx * 4, (shelfIdx + 1) * 4);
            return (
              <div key={shelfIdx} className="relative pt-6">
                {/* 선반 위의 책들 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 px-6 z-10 relative items-end">
                  {shelfBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => onSelectBook(book)}
                      className="cursor-pointer group flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300"
                    >
                      <div className="w-32 sm:w-36 aspect-[3/4] relative rounded-md overflow-hidden shadow-2xl border-l-4 border-l-stone-950 border-r border-stone-800">
                        <img
                          src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-serif font-bold text-stone-200 line-clamp-1 text-center group-hover:text-amber-300">
                        {book.title}
                      </p>
                      <p className="text-[10px] text-stone-400 line-clamp-1">{book.author}</p>
                    </div>
                  ))}
                </div>

                {/* 원목 선반 바닥 그래픽 */}
                <div className="bookshelf-wood-shelf mt-2 w-full h-6 bg-gradient-to-b from-amber-900 via-stone-900 to-stone-950 border-t-2 border-amber-600/50 shadow-2xl rounded-sm" />
              </div>
            );
          })}
        </div>
      )}

      {/* 3. 리스트 뷰 */}
      {viewMode === 'list' && sortedBooks.length > 0 && (
        <div className="space-y-3">
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="flex items-center justify-between p-4 bg-stone-900/80 hover:bg-stone-900 border border-stone-800/80 hover:border-amber-500/40 rounded-xl cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded shadow-md flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
                      {book.category}
                    </span>
                    <h3 className="font-serif font-bold text-stone-100 text-sm group-hover:text-amber-300 transition-colors">
                      {book.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    {book.author} · {book.publisher}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-stone-400">
                {book.rating && (
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{book.rating}.0</span>
                  </div>
                )}
                {book.writingInsights && book.writingInsights.length > 0 && (
                  <span className="text-amber-300 font-medium">
                    💡 집필노트 {book.writingInsights.length}개
                  </span>
                )}
                <span className="text-stone-500">
                  {book.status === 'completed' ? '완독' : book.status === 'reading' ? '읽는 중' : '위시리스트'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
