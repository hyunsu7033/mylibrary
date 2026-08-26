'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Award, 
  Flame, 
  CheckCircle2, 
  BookmarkPlus, 
  BookmarkCheck 
} from 'lucide-react';
import { PersonalBook } from '@/lib/types';
import { getStoredApiKey, getStoredProfile, saveStoredThought } from '@/lib/db';
import confetti from 'canvas-confetti';

interface AIChatBotProps {
  book: PersonalBook;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isSimulated?: boolean;
}

export default function AIChatBot({ book }: AIChatBotProps) {
  const profile = getStoredProfile();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      role: 'assistant',
      content: `반가워, ${profile.ownerName}! 🚀 나는 네 독서 메이트 '루카'야. 《${book.title}》의 명장면과 등장인물의 깊은 속마음에 대해 어떤 생각이든 편하게 나눠보자! ✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedMsgIds, setSavedMsgIds] = useState<Set<string>>(new Set());
  const [toastText, setToastText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = getStoredApiKey();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          bookContext: book,
          userApiKey: apiKey,
          userName: profile.ownerName,
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulated: data.isSimulated,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: '이야기를 나누는 중에 잠시 통신이 지연되었습니다. 다시 한 번 물어봐줘! ✨',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDialogue = (aiMsg: ChatMessage, msgIndex: number) => {
    if (savedMsgIds.has(aiMsg.id)) return;

    let userQ = '도서 탐구 대화';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userQ = messages[i].content;
        break;
      }
    }

    saveStoredThought({
      bookId: book.id,
      bookTitle: book.title,
      bookCoverUrl: book.coverUrl,
      category: book.category,
      userQuestion: userQ,
      aiResponse: aiMsg.content,
    });

    setSavedMsgIds((prev) => {
      const next = new Set(prev);
      next.add(aiMsg.id);
      return next;
    });

    confetti({ particleCount: 35, spread: 45, origin: { y: 0.8 } });
    setToastText(`⭐ 대화가 날짜/시간과 함께 [AI 생각노트]에 보관되었습니다!`);
    setTimeout(() => setToastText(null), 3500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col h-[600px]">
      
      {/* Toast Alert */}
      {toastText && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-fade-in shadow-md">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {toastText}
          </span>
          <a href="/journal" className="underline text-[11px] hover:text-amber-100">
            생각노트 보기 ↗
          </a>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/60">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isSaved = savedMsgIds.has(msg.id);

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-sm shrink-0 ${
                  isUser
                    ? 'bg-amber-500 text-white'
                    : 'bg-gradient-to-tr from-cosmic-600 to-indigo-600 text-white'
                }`}
              >
                {isUser ? profile.avatarEmoji : '🤖'}
              </div>

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-amber-500 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div
                  className={`text-[10px] mt-2 pt-1 border-t flex flex-wrap items-center justify-between gap-1.5 ${
                    isUser ? 'text-white/70 border-white/10' : 'text-slate-400 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{msg.timestamp}</span>
                    {msg.isSimulated && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-medium">
                        스마트시뮬레이션
                      </span>
                    )}
                  </div>

                  {!isUser && msg.id !== 'msg-init' && (
                    <div>
                      {isSaved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                          <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                          생각노트에 저장됨
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveDialogue(msg, idx)}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-2 py-0.5 rounded-full font-semibold transition border border-slate-200 hover:border-amber-300"
                        >
                          <BookmarkPlus className="w-3 h-3 text-amber-500" />
                          ⭐ 생각노트에 저장
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cosmic-600 to-indigo-600 text-white flex items-center justify-center text-sm shadow-sm">
              🤖
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 pl-1">생각하는 중...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-500" /> 추천 토론:
        </span>
        <button
          type="button"
          onClick={() => handleSendMessage('주인공의 가장 결정적인 선택과 그 심리를 분석해줘!')}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 shrink-0 border border-slate-200 transition"
        >
          💭 주인공의 핵심 심리는?
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('만약 내가 이 소설 속 주인공의 처지였다면 어떤 결정을 내렸을까?')}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 shrink-0 border border-slate-200 transition"
        >
          🌟 만약 내가 주인공이라면?
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('이 책에서 작가가 전하고자 한 가장 깊은 메시지와 상징은 무엇일까?')}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 shrink-0 border border-slate-200 transition"
        >
          💡 핵심 주제와 상징 탐구
        </button>
      </div>

      {/* Input Footer */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`《${book.title}》에 대해 AI 북버디 루카에게 무엇이든 물어보세요...`}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
