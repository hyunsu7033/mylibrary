import { useState } from 'react';
import type { FormEvent, FC } from 'react';
import type { Book, WritingInsight } from '../types/book';
import { LatexRenderer } from './LatexRenderer';
import { LatexHelper } from './LatexHelper';
import { Lightbulb, Plus, Trash2, Copy, Check, FileDown, Edit2, Tag, BookMarked } from 'lucide-react';

interface InsightVaultProps {
  book: Book;
  onUpdateBook: (updated: Book) => void;
}

export const InsightVault: FC<InsightVaultProps> = ({ book, onUpdateBook }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<WritingInsight>>({
    title: '',
    concept: '',
    summary: '',
    latexFormula: '',
    myApplication: '',
    originalQuote: '',
    sourceChapter: '',
    tags: [],
  });

  const [tagsInput, setTagsInput] = useState('');

  const handleSaveInsight = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (editingId) {
      // 수정
      const updatedList = (book.writingInsights || []).map((item) =>
        item.id === editingId
          ? ({
              ...item,
              ...form,
              tags: tags.length > 0 ? tags : item.tags,
            } as WritingInsight)
          : item
      );
      onUpdateBook({
        ...book,
        writingInsights: updatedList,
        updatedAt: new Date().toISOString(),
      });
      setEditingId(null);
    } else {
      // 새로 추가
      const newInsight: WritingInsight = {
        id: 'ins-' + Date.now(),
        title: form.title || '새 집필 인사이트',
        concept: form.concept || '',
        summary: form.summary || '',
        latexFormula: form.latexFormula || '',
        myApplication: form.myApplication || '',
        originalQuote: form.originalQuote || '',
        sourceChapter: form.sourceChapter || '',
        tags: tags.length > 0 ? tags : ['집필노트', book.category],
        createdAt: new Date().toISOString(),
      };

      onUpdateBook({
        ...book,
        writingInsights: [newInsight, ...(book.writingInsights || [])],
        updatedAt: new Date().toISOString(),
      });
      setIsAdding(false);
    }

    // 폼 리셋
    setForm({
      title: '',
      concept: '',
      summary: '',
      latexFormula: '',
      myApplication: '',
      originalQuote: '',
      sourceChapter: '',
      tags: [],
    });
    setTagsInput('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 집필 인사이트를 삭제하시겠습니까?')) {
      const filtered = (book.writingInsights || []).filter((item) => item.id !== id);
      onUpdateBook({
        ...book,
        writingInsights: filtered,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleStartEdit = (item: WritingInsight) => {
    setEditingId(item.id);
    setForm(item);
    setTagsInput(item.tags?.join(', ') || '');
    setIsAdding(true);
  };

  // 마크다운/LaTeX 형식으로 복사 (저술용)
  const handleCopyMarkdown = (item: WritingInsight) => {
    const md = `### [집필 레퍼런스] ${item.title}
- **출처 도서**: 《${book.title}》 (${book.author}) ${item.sourceChapter ? `/ ${item.sourceChapter}` : ''}
${item.originalQuote ? `> "${item.originalQuote}"\n` : ''}
- **핵심 개념**: ${item.concept}
- **내용 요약**: ${item.summary}
${item.latexFormula ? `\n$$${item.latexFormula}$$\n` : ''}
- **💡 나의 책 적용 방안**:
${item.myApplication}
- **태그**: ${item.tags?.map((t) => `#${t}`).join(' ')}
`;
    navigator.clipboard.writeText(md);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 전체 집필 노트 Markdown 파일로 내보내기
  const handleExportAllMarkdown = () => {
    if (!book.writingInsights || book.writingInsights.length === 0) {
      alert('내보낼 집필 인사이트가 없습니다.');
      return;
    }

    let fullMd = `# 《${book.title}》 집필용 인사이트 아카이브\n`;
    fullMd += `**저자**: ${book.author} | **출판사**: ${book.publisher}\n`;
    fullMd += `**정리 일자**: ${new Date().toLocaleDateString()}\n\n---\n\n`;

    book.writingInsights.forEach((item, idx) => {
      fullMd += `## ${idx + 1}. ${item.title}\n`;
      if (item.sourceChapter) fullMd += `*출처: ${item.sourceChapter}*\n\n`;
      if (item.originalQuote) fullMd += `> "${item.originalQuote}"\n\n`;
      fullMd += `### 핵심 개념\n${item.concept}\n\n`;
      fullMd += `### 내용 요약 & 재해석\n${item.summary}\n\n`;
      if (item.latexFormula) fullMd += `### 수학/공학 모델\n$$${item.latexFormula}$$\n\n`;
      fullMd += `### 💡 내 책에 적용할 아이디어 (Author's Application)\n${item.myApplication}\n\n`;
      if (item.tags?.length) fullMd += `**태그**: ${item.tags.map((t) => `#${t}`).join(' ')}\n\n`;
      fullMd += `---\n\n`;
    });

    const blob = new Blob([fullMd], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Insight_${book.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="insight-vault space-y-4">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-stone-900/40 border border-amber-900/40 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
              저술용 인사이트 & 아이디어 보관소 (Author's Vault)
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 font-sans font-normal border border-amber-700/50">
                {book.writingInsights?.length || 0}개
              </span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              책을 읽으며 얻은 통찰과 AI 심층 토론 내용을 구조화하여 나중에 내 책을 집필할 때 바로 인용할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {book.writingInsights && book.writingInsights.length > 0 && (
            <button
              onClick={handleExportAllMarkdown}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition-colors flex items-center gap-1.5 border border-stone-700"
              title="Markdown 파일로 다운로드"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>전체 원고 내보내기 (.md)</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
            }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? '작성 닫기' : '새 집필 아이디어 추가'}</span>
          </button>
        </div>
      </div>

      {/* 작성 / 수정 폼 */}
      {isAdding && (
        <form
          onSubmit={handleSaveInsight}
          className="p-5 bg-stone-950/80 border border-amber-500/40 rounded-xl space-y-4 shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <h4 className="text-sm font-serif font-bold text-amber-300">
              {editingId ? '집필 인사이트 수정' : '💡 새로운 집필 아이디어 카드 작성'}
            </h4>
            <span className="text-[11px] text-stone-400">수식에 $...$ 또는 $$...$$ 사용 가능</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">인사이트 소제목 *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 최적 제어와 변분법의 결합 모델"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">출처 챕터 / 페이지</label>
              <input
                type="text"
                value={form.sourceChapter}
                onChange={(e) => setForm({ ...form, sourceChapter: e.target.value })}
                placeholder="예: 제3장 p.145 또는 역학 강의록"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">원문 인용구 (선택)</label>
            <input
              type="text"
              value={form.originalQuote}
              onChange={(e) => setForm({ ...form, originalQuote: e.target.value })}
              placeholder="인상 깊었던 원문 구절을 기록하세요"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500 italic"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">핵심 개념 (Concept)</label>
            <textarea
              rows={2}
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
              placeholder="책에서 다룬 핵심 이론/공학 원리를 1~2문장으로 정리"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* LaTeX 수식 템플릿 도우미 */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">수학·공학 LaTeX 수식 (선택)</label>
            <LatexHelper
              onInsert={(tex) => setForm({ ...form, latexFormula: (form.latexFormula ? form.latexFormula + '\n' : '') + tex.replace(/^\$|\$$/g, '') })}
            />
            <input
              type="text"
              value={form.latexFormula}
              onChange={(e) => setForm({ ...form, latexFormula: e.target.value })}
              placeholder="예: \nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}"
              className="w-full mt-2 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-sm font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">
              ⭐️ 내가 쓸 책에 어떻게 적용할 것인가? (My Application & Argument) *
            </label>
            <textarea
              rows={3}
              required
              value={form.myApplication}
              onChange={(e) => setForm({ ...form, myApplication: e.target.value })}
              placeholder="내 책의 몇 장에 어떤 논리로 넣을 것인가? 저자의 주장을 어떻게 반박하거나 확장할 것인가?"
              className="w-full px-3 py-2 bg-stone-900 border border-amber-600/50 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">태그 (쉼표로 구분)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="예: 수치해석, 최적화, 1장서론"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg text-xs hover:bg-stone-700"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors"
            >
              {editingId ? '수정 완료' : '아이디어 카드 저장'}
            </button>
          </div>
        </form>
      )}

      {/* 인사이트 카드 목록 */}
      <div className="space-y-3.5">
        {(!book.writingInsights || book.writingInsights.length === 0) && !isAdding && (
          <div className="p-8 text-center bg-stone-950/40 border border-dashed border-stone-800 rounded-xl">
            <BookMarked className="w-10 h-10 text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-serif text-stone-300">아직 등록된 집필 인사이트가 없습니다.</p>
            <p className="text-xs text-stone-400 mt-1">
              위의 [AI 심층 토론]에서 유용한 통찰을 바로 보관하거나, [+ 새 집필 아이디어 추가] 버튼으로 직접 등록하세요.
            </p>
          </div>
        )}

        {book.writingInsights?.map((item) => (
          <div
            key={item.id}
            className="insight-card p-4 bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 rounded-xl transition-all shadow-md group"
          >
            {/* 카드 상단 헤더 */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-800/60">
              <div>
                <h4 className="font-serif font-bold text-stone-100 text-base text-amber-200">
                  {item.title}
                </h4>
                {item.sourceChapter && (
                  <span className="text-[11px] text-stone-400 mt-0.5 inline-block">
                    출처: {item.sourceChapter}
                  </span>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleCopyMarkdown(item)}
                  className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                  title="저술용 마크다운 복사"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                  title="수정"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 카드 내용 */}
            <div className="mt-3 space-y-2.5 text-sm">
              {/* 원문 인용 */}
              {item.originalQuote && (
                <blockquote className="text-xs text-amber-300/80 bg-amber-950/20 border-l-2 border-amber-500/60 pl-3 py-1 italic font-serif">
                  "{item.originalQuote}"
                </blockquote>
              )}

              {/* 핵심 개념 */}
              {item.concept && (
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-0.5">
                    핵심 개념
                  </span>
                  <div className="text-stone-300 text-xs leading-relaxed">
                    <LatexRenderer content={item.concept} />
                  </div>
                </div>
              )}

              {/* 요약 */}
              {item.summary && item.summary !== item.concept && (
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-0.5">
                    요약 및 재해석
                  </span>
                  <div className="text-stone-300 text-xs leading-relaxed">
                    <LatexRenderer content={item.summary} />
                  </div>
                </div>
              )}

              {/* LaTeX 수식 블록 */}
              {item.latexFormula && (
                <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800/80 overflow-x-auto">
                  <LatexRenderer content={`$$${item.latexFormula}$$`} />
                </div>
              )}

              {/* ⭐️ 내 책에 적용할 아이디어 */}
              {item.myApplication && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg mt-2">
                  <span className="text-xs font-serif font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    내 책에 적용할 아이디어 (Author's Application)
                  </span>
                  <div className="text-amber-100/90 text-xs leading-relaxed">
                    <LatexRenderer content={item.myApplication} />
                  </div>
                </div>
              )}

              {/* 태그 */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-stone-400" />
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
