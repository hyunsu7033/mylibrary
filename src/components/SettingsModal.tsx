import { useState } from 'react';
import type { FormEvent, FC } from 'react';
import type { AppSettings } from '../types/book';
import { X, Key, Cloud, User, Palette, ExternalLink, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [googleClientId, setGoogleClientId] = useState(settings.googleClientId || '');
  const [authorName, setAuthorName] = useState(settings.authorName || '학술 연구자');
  const [theme, setTheme] = useState(settings.theme || 'dark-library');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      geminiApiKey: geminiApiKey.trim(),
      googleClientId: googleClientId.trim(),
      authorName: authorName.trim(),
      theme,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="modal-container w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-serif font-bold text-stone-100">서재 환경 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* 1. Gemini API 키 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Google Gemini API Key (AI 심층 토론용)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                API 키 무료 발급 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-stone-400">
              API 키는 브라우저 내부 로컬에만 안전하게 보관되며 서버로 전송되지 않습니다.
            </p>
          </div>

          {/* 2. Google OAuth Client ID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-sky-400" /> Google Client ID (Google Drive 백업용)
              </label>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
              >
                GCP 콘솔에서 생성 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="xxxxxx-xxxxxxxx.apps.googleusercontent.com"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-stone-400">
              구글 드라이브 동기화를 원하시면 Google Cloud Console에서 OAuth 2.0 웹 클라이언트 ID를 입력해주세요. (미입력 시에도 로컬 JSON 백업은 바로 가능합니다)
            </p>
          </div>

          {/* 3. 저자 / 연구자 이름 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" /> 저자 / 서재 소유자명
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="홍길동"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-stone-400">
              집필 노트 및 백업 파일 내보내기 시 작성자명으로 표시됩니다.
            </p>
          </div>

          {/* 4. 서재 테마 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" /> 서재 비주얼 테마
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark-library', name: '고서재 다크 (Dark Library)', desc: '클래식 앤틱' },
                { id: 'academic-light', name: '학술 라이트 (Academic)', desc: '연구실 톤' },
                { id: 'midnight-wood', name: '미드나잇 우드', desc: '심야 서재' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    theme === t.id
                      ? 'border-amber-500 bg-amber-950/30 text-amber-200'
                      : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <p className="text-xs font-bold text-stone-200">{t.name}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-2 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs hover:bg-stone-700"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-lg"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-stone-950" /> 저장 완료!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> 설정 저장
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
