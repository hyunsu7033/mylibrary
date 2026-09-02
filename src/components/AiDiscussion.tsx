import { useState, useRef, useEffect } from 'react';
import type { FormEvent, FC } from 'react';
import type { Book, AiChatMessage, WritingInsight } from '../types/book';
import { sendBookChatMessage, extractWritingInsightFromDiscussion } from '../services/gemini';
import { LatexRenderer } from './LatexRenderer';
import { LatexHelper } from './LatexHelper';
import { Sparkles, Send, Loader2, BookmarkPlus, Quote, HelpCircle, RotateCcw } from 'lucide-react';

interface AiDiscussionProps {
  book: Book;
  apiKey: string;
  onUpdateBook: (updated: Book) => void;
  onOpenSettings: () => void;
}

export const AiDiscussion: FC<AiDiscussionProps> = ({
  book,
  apiKey,
  onUpdateBook,
  onOpenSettings,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [book.aiChatHistory, isLoading]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    if (!apiKey) {
      alert('Gemini API 키가 필요합니다. 상단 설정 메뉴에서 API 키를 입력해주세요.');
      onOpenSettings();
      return;
    }

    const userText = inputMessage.trim();
    const currentQuote = selectedQuote;

    const userMessage: AiChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
      referenceQuote: currentQuote,
    };

    const newHistory = [...(book.aiChatHistory || []), userMessage];

    // 낙관적 업데이트
    onUpdateBook({
      ...book,
      aiChatHistory: newHistory,
      updatedAt: new Date().toISOString(),
    });

    setInputMessage('');
    setSelectedQuote(undefined);
    setIsLoading(true);

    try {
      const reply = await sendBookChatMessage(
        apiKey,
        book,
        userText,
        newHistory,
        currentQuote
      );

      const assistantMessage: AiChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };

      onUpdateBook({
        ...book,
        aiChatHistory: [...newHistory, assistantMessage],
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error(err);
      alert('AI 대화 응답 중 오류가 발생했습니다: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  // 대화 메시지로부터 "집필용 인사이트" 자동 추출 & 추가
  const handleConvertToInsight = async (message: AiChatMessage) => {
    if (!apiKey) {
      onOpenSettings();
      return;
    }

    setExtractingId(message.id);
    try {
      const insightData = await extractWritingInsightFromDiscussion(
        apiKey,
        book,
        message.content
      );

      const newInsight: WritingInsight = {
        id: 'ins-' + Date.now(),
        title: insightData.title || '새로운 집필 아이디어',
        concept: insightData.concept || '',
        summary: insightData.summary || message.content.slice(0, 150),
        latexFormula: insightData.latexFormula || '',
        myApplication: insightData.myApplication || '집필 도서에 반영 예정',
        originalQuote: message.referenceQuote,
        tags: insightData.tags && insightData.tags.length > 0 ? insightData.tags : ['AI심층토론', book.category],
        createdAt: new Date().toISOString(),
      };

      onUpdateBook({
        ...book,
        writingInsights: [newInsight, ...(book.writingInsights || [])],
        updatedAt: new Date().toISOString(),
      });

      alert(`'${newInsight.title}'이(가) 책 하단 [집필용 인사이트 보관소]에 성공적으로 정리되었습니다!`);
    } catch (err: any) {
      alert('인사이트 변환 중 오류: ' + err.message);
    } finally {
      setExtractingId(null);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('이 책의 AI 대화 기록을 모두 초기화하시겠습니까? (집필 노트는 유지됩니다)')) {
      onUpdateBook({
        ...book,
        aiChatHistory: [],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // 추천 학술 질문 템플릿
  const suggestedQuestions = [
    '이 책의 핵심 수학적 모델을 다른 공학 시스템에 어떻게 확장 적용할 수 있을까요?',
    '저자의 논증 과정에서 비판적으로 검토하거나 보완할 수 있는 한계점은 무엇인가요?',
    '내가 쓸 학술/기술 서적의 독창적인 챕터 구성 아이디어를 제안해주세요.',
  ];

  return (
    <div className="ai-discussion-container flex flex-col h-full bg-stone-950/40 rounded-xl border border-stone-800/80 overflow-hidden">
      {/* 헤더 안내 바 */}
      <div className="px-4 py-2.5 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-serif font-bold text-stone-200">
              학술 AI 심층 토론 & 저술 파트너
            </h3>
            <p className="text-[11px] text-stone-400">
              LaTeX 수식($...$, $$...$$) 및 집필 레퍼런스 자동 추출 지원
            </p>
          </div>
        </div>

        {book.aiChatHistory && book.aiChatHistory.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-[11px] text-stone-400 hover:text-stone-300 flex items-center gap-1 px-2 py-1 bg-stone-800/50 hover:bg-stone-800 rounded transition-colors"
            title="대화 내역 초기화"
          >
            <RotateCcw className="w-3 h-3" /> 대화 초기화
          </button>
        )}
      </div>

      {/* 대화 메시지 영역 */}
      <div className="chat-messages p-4 overflow-y-auto flex-grow space-y-4 max-h-[480px]">
        {(!book.aiChatHistory || book.aiChatHistory.length === 0) && (
          <div className="py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-semibold text-stone-200 text-sm mb-1">
              《{book.title}》에 대한 심층 대화를 시작하세요
            </h4>
            <p className="text-xs text-stone-400 max-w-md mx-auto mb-4 leading-relaxed">
              도서 내용, 수학적 증명, 공학적 모델링, 그리고 향후 저술에 활용할 아이디어를 심층적으로 토론하고 버튼 클릭 한 번으로 집필 노트로 보관할 수 있습니다.
            </p>

            {/* 추천 질문 목록 */}
            <div className="flex flex-col gap-2 max-w-lg mx-auto text-left">
              <span className="text-[11px] font-semibold text-amber-400/90 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> 추천 논점 질문:
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(q)}
                  className="text-xs text-stone-300 bg-stone-900/90 hover:bg-amber-950/40 hover:text-amber-200 p-2.5 rounded-lg border border-stone-800 text-left transition-colors"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {book.aiChatHistory?.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* 유저가 인용한 구절이 있는 경우 */}
            {msg.referenceQuote && (
              <div className="mb-1 text-xs text-amber-300/80 bg-amber-950/30 border-l-2 border-amber-500 px-2.5 py-1 rounded max-w-[85%] flex items-center gap-1.5 font-serif italic">
                <Quote className="w-3 h-3 flex-shrink-0" />
                <span className="line-clamp-1">"{msg.referenceQuote}"</span>
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-4 text-sm shadow-md ${
                msg.role === 'user'
                  ? 'bg-amber-700 text-stone-100 rounded-br-none'
                  : 'bg-stone-900 text-stone-200 border border-stone-800 rounded-bl-none'
              }`}
            >
              {/* LaTeX 수식 및 마크다운 렌더링 */}
              <LatexRenderer content={msg.content} />
            </div>

            {/* AI 답변 하단 유틸리티 (집필 노트로 보관 버튼) */}
            {msg.role === 'assistant' && (
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  disabled={extractingId === msg.id}
                  onClick={() => handleConvertToInsight(msg)}
                  className="text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                  {extractingId === msg.id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      집필 인사이트 추출 중...
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      💡 집필 노트로 보관
                    </>
                  )}
                </button>
                <span className="text-[10px] text-stone-400">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-2 text-stone-400 text-sm">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>학술 논점 및 수학 모델을 분석하고 있습니다...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 하단 입력 영역 */}
      <div className="p-3 bg-stone-900/90 border-t border-stone-800 space-y-2">
        {/* LaTeX 수식 도우미 툴바 */}
        <LatexHelper onInsert={(tex) => setInputMessage((prev) => prev + ' ' + tex)} />

        {/* 선택된 인용구 표시 */}
        {selectedQuote && (
          <div className="flex items-center justify-between bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs text-amber-200">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Quote className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">인용구: "{selectedQuote}"</span>
            </div>
            <button
              onClick={() => setSelectedQuote(undefined)}
              className="text-stone-400 hover:text-stone-200 ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* 입력 폼 */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="수학적 질문, 논점 토론, 또는 책의 특정 파트에 대해 물어보세요... (Shift+Enter: 줄바꿈)"
            className="flex-grow p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:border-amber-500 resize-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold rounded-xl transition-all flex flex-col items-center justify-center shadow-lg"
          >
            <Send className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">전송</span>
          </button>
        </form>
      </div>
    </div>
  );
};
