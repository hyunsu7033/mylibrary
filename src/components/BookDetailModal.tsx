import { useState } from 'react';
import type { FormEvent, FC } from 'react';
import type { Book, ReadingNote, ReadingStatus } from '../types/book';
import { AiDiscussion } from './AiDiscussion';
import { InsightVault } from './InsightVault';
import { LatexRenderer } from './LatexRenderer';
import { LatexHelper } from './LatexHelper';
import {
  X,
  Star,
  BookOpen,
  Sparkles,
  Lightbulb,
  FileText,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book;
  apiKey: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBook: (updated: Book) => void;
  onDeleteBook: (id: string) => void;
  onOpenSettings: () => void;
}

export const BookDetailModal: FC<BookDetailModalProps> = ({
  book,
  apiKey,
  isOpen,
  onClose,
  onUpdateBook,
  onDeleteBook,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'ai' | 'insights' | 'info'>('notes');

  // 독서 메모 작성 상태
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteForm, setNoteForm] = useState<Partial<ReadingNote>>({
    chapter: '',
    page: undefined,
    quote: '',
    thought: '',
    latex: '',
  });

  // 총평 편집 상태
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(book.summaryReview || '');

  if (!isOpen) return null;

  // 독서 상태 변경
  const handleStatusChange = (status: ReadingStatus) => {
    const updated: Book = {
      ...book,
      status,
      endDate: status === 'completed' && !book.endDate ? new Date().toISOString().slice(0, 10) : book.endDate,
      updatedAt: new Date().toISOString(),
    };
    onUpdateBook(updated);
  };

  // 평점 변경
  const handleRatingChange = (rating: number) => {
    onUpdateBook({
      ...book,
      rating,
      updatedAt: new Date().toISOString(),
    });
  };

  // 현재 페이지 변경
  const handlePageChange = (page: number) => {
    onUpdateBook({
      ...book,
      currentPage: Math.max(0, page),
      updatedAt: new Date().toISOString(),
    });
  };

  // 새 메모 저장
  const handleSaveNote = (e: FormEvent) => {
    e.preventDefault();
    if (!noteForm.thought?.trim() && !noteForm.quote?.trim()) return;

    const newNote: ReadingNote = {
      id: 'note-' + Date.now(),
      chapter: noteForm.chapter || '',
      page: noteForm.page ? Number(noteForm.page) : undefined,
      quote: noteForm.quote || '',
      thought: noteForm.thought || '',
      latex: noteForm.latex || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateBook({
      ...book,
      notes: [newNote, ...(book.notes || [])],
      updatedAt: new Date().toISOString(),
    });

    setNoteForm({
      chapter: '',
      page: undefined,
      quote: '',
      thought: '',
      latex: '',
    });
    setIsAddingNote(false);
  };

  // 메모 삭제
  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('이 독서 메모를 삭제하시겠습니까?')) {
      onUpdateBook({
        ...book,
        notes: (book.notes || []).filter((n) => n.id !== noteId),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // 총평 저장
  const handleSaveSummary = () => {
    onUpdateBook({
      ...book,
      summaryReview: summaryText,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingSummary(false);
  };

  const progressPercent = book.totalPages && book.currentPage
    ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))
    : (book.status === 'completed' ? 100 : 0);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="modal-container w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 상단 헤더 및 책 요약 정보 */}
        <div className="p-5 md:p-6 bg-stone-950/80 border-b border-stone-800 flex flex-col md:flex-row gap-5 items-start justify-between">
          <div className="flex gap-4 items-start w-full md:w-auto">
            <img
              src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
              alt={book.title}
              className="w-20 md:w-24 h-28 md:h-34 object-cover rounded-lg shadow-xl border border-stone-800 flex-shrink-0 bg-stone-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
              }}
            />
            <div className="flex flex-col justify-between flex-grow">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/50 font-medium">
                    {book.category || '수학/공학'}
                  </span>
                  {book.isbn && (
                    <span className="text-[11px] text-stone-400 font-mono">
                      ISBN: {book.isbn}
                    </span>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-100 leading-tight">
                  {book.title}
                </h1>
                <p className="text-xs md:text-sm text-stone-400 mt-1">
                  {book.author} 저 · {book.publisher} {book.publishDate ? `(${book.publishDate})` : ''}
                </p>
              </div>

              {/* 평점 및 상태 설정 */}
              <div className="flex flex-wrap items-center gap-4 mt-3 pt-2 border-t border-stone-800/80">
                {/* 별점 */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="text-stone-600 hover:text-amber-400 transition-colors p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${star <= (book.rating || 0) ? 'fill-amber-400 text-amber-400' : ''}`}
                      />
                    </button>
                  ))}
                </div>

                {/* 상태 선택 */}
                <select
                  value={book.status}
                  onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
                  className="px-2.5 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="reading">📖 읽는 중</option>
                  <option value="completed">✅ 완독</option>
                  <option value="wishlist">⏳ 읽고 싶은 책</option>
                  <option value="paused">⏸️ 보류</option>
                </select>

                {/* 페이지 진행률 */}
                {book.totalPages && (
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <input
                      type="number"
                      value={book.currentPage || 0}
                      onChange={(e) => handlePageChange(Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 bg-stone-900 border border-stone-700 rounded text-center text-stone-100 text-xs"
                    />
                    <span>/ {book.totalPages}p ({progressPercent}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors self-end md:self-start"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-6">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            독서 기록 & 메모 ({book.notes?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'ai'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI 심층 토론 ({book.aiChatHistory?.length ? Math.floor(book.aiChatHistory.length / 2) : 0})
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'insights'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            집필용 인사이트 보관소 ({book.writingInsights?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            책 소개 & 총평
          </button>
        </div>

        {/* 탭 본문 영역 */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* 1. 독서 기록 & 메모 탭 */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* 메모 추가 버튼 & 작성 폼 */}
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-serif font-bold text-stone-200">
                  내가 읽은 부분의 구절 및 생각 기록
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingNote ? '작성 닫기' : '새 독서 메모 추가'}
                </button>
              </div>

              {isAddingNote && (
                <form
                  onSubmit={handleSaveNote}
                  className="p-4 bg-stone-950/70 border border-stone-800 rounded-xl space-y-3 animate-fade-in"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={noteForm.chapter}
                      onChange={(e) => setNoteForm({ ...noteForm, chapter: e.target.value })}
                      placeholder="챕터명 (예: 제2장 미분방정식의 해법)"
                      className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      value={noteForm.page || ''}
                      onChange={(e) => setNoteForm({ ...noteForm, page: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="페이지 번호 (예: 142)"
                      className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={noteForm.quote}
                      onChange={(e) => setNoteForm({ ...noteForm, quote: e.target.value })}
                      placeholder="인상 깊었던 구절이나 책의 원문을 입력하세요"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs italic focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 수식 도우미 및 LaTeX 입력 */}
                  <div>
                    <LatexHelper onInsert={(tex) => setNoteForm({ ...noteForm, latex: (noteForm.latex ? noteForm.latex + ' ' : '') + tex })} />
                    <input
                      type="text"
                      value={noteForm.latex}
                      onChange={(e) => setNoteForm({ ...noteForm, latex: e.target.value })}
                      placeholder="LaTeX 수식 (예: \int_0^\infty e^{-x} dx = 1)"
                      className="w-full mt-2 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      required
                      value={noteForm.thought}
                      onChange={(e) => setNoteForm({ ...noteForm, thought: e.target.value })}
                      placeholder="나의 생각, 의문점, 공학적 고찰을 기록하세요 (수식 $...$ 사용 가능)"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-lg text-xs"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs"
                    >
                      메모 저장
                    </button>
                  </div>
                </form>
              )}

              {/* 메모 목록 */}
              <div className="space-y-3">
                {(!book.notes || book.notes.length === 0) && !isAddingNote && (
                  <div className="p-8 text-center bg-stone-950/30 border border-stone-800/80 rounded-xl text-stone-400">
                    <FileText className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                    <p className="text-sm">아직 작성된 독서 메모가 없습니다.</p>
                    <p className="text-xs mt-1">인상 깊은 구절과 생각을 기록해보세요.</p>
                  </div>
                )}

                {book.notes?.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-2 relative group hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-center text-xs text-stone-400">
                      <div className="flex items-center gap-2">
                        {n.chapter && <span className="font-semibold text-amber-300">{n.chapter}</span>}
                        {n.page && <span>p.{n.page}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 rounded"
                        title="메모 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {n.quote && (
                      <blockquote className="text-xs text-amber-200/80 bg-amber-950/20 border-l-2 border-amber-500 pl-2.5 py-1 italic font-serif">
                        "{n.quote}"
                      </blockquote>
                    )}

                    {n.latex && (
                      <div className="p-2 bg-stone-900 rounded border border-stone-800 text-xs overflow-x-auto">
                        <LatexRenderer content={`$$${n.latex}$$`} />
                      </div>
                    )}

                    <div className="text-stone-200 text-xs leading-relaxed">
                      <LatexRenderer content={n.thought} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단에 집필용 인사이트 보관소 미리보기 포함 (요구사항 5번: 4번 내용이 책 아래부분에 잘 정리) */}
              <div className="mt-8 pt-6 border-t border-stone-800">
                <InsightVault book={book} onUpdateBook={onUpdateBook} />
              </div>
            </div>
          )}

          {/* 2. AI 심층 토론 탭 */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <AiDiscussion
                book={book}
                apiKey={apiKey}
                onUpdateBook={onUpdateBook}
                onOpenSettings={onOpenSettings}
              />

              {/* 하단에 바로 연동되는 집필용 인사이트 아카이브 */}
              <div className="pt-6 border-t border-stone-800">
                <InsightVault book={book} onUpdateBook={onUpdateBook} />
              </div>
            </div>
          )}

          {/* 3. 집필용 인사이트 탭 */}
          {activeTab === 'insights' && (
            <InsightVault book={book} onUpdateBook={onUpdateBook} />
          )}

          {/* 4. 책 소개 & 총평 탭 */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* 책 소개 */}
              <div>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">도서 소개</h3>
                <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                  {book.description || '등록된 도서 소개가 없습니다.'}
                </div>
              </div>

              {/* 나의 총평 및 서평 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">나의 총평 및 서평</h3>
                  {!isEditingSummary ? (
                    <button
                      onClick={() => setIsEditingSummary(true)}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      편집하기
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveSummary}
                      className="px-3 py-1 bg-amber-600 text-stone-950 font-bold rounded text-xs flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" /> 저장
                    </button>
                  )}
                </div>

                {isEditingSummary ? (
                  <textarea
                    rows={6}
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    placeholder="이 책에 대한 나의 최종 평가와 핵심 요약을 작성하세요."
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                ) : (
                  <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl text-stone-200 text-sm leading-relaxed whitespace-pre-line">
                    <LatexRenderer content={book.summaryReview || '아직 작성된 총평이 없습니다. [편집하기]를 눌러 서평을 작성해보세요.'} />
                  </div>
                )}
              </div>

              {/* 도서 삭제 버튼 */}
              <div className="pt-6 border-t border-stone-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`《${book.title}》을(를) 서재에서 정말 삭제하시겠습니까?`)) {
                      onDeleteBook(book.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 rounded-xl text-xs border border-rose-900/40 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  서재에서 이 도서 삭제
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
