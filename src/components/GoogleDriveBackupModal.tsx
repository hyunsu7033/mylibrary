import React, { useState, useEffect } from 'react';
import { Book, AppSettings, BackupData } from '../types/book';
import {
  getGoogleDriveAccessToken,
  uploadBackupToDrive,
  listDriveBackups,
  downloadBackupFromDrive,
  DriveBackupFile,
} from '../services/googleDrive';
import { exportBackupData, importBackupData } from '../services/storage';
import {
  X,
  Cloud,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileJson,
  Key,
} from 'lucide-react';

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  settings: AppSettings;
  onRestoreBooks: (restoredBooks: Book[], settings?: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
}

export const GoogleDriveBackupModal: React.FC<GoogleDriveBackupModalProps> = ({
  isOpen,
  onClose,
  books,
  settings,
  onRestoreBooks,
  onOpenSettings,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isOpen) return null;

  // 구글 드라이브 로그인 및 토큰 요청
  const handleConnectGoogleDrive = async () => {
    if (!settings.googleClientId) {
      setStatusMessage({
        text: 'Google Client ID가 설정되지 않았습니다. [설정]에서 Client ID를 먼저 등록해주세요.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: '구글 계정 인증을 진행하고 있습니다...', type: 'info' });
    try {
      const token = await getGoogleDriveAccessToken(settings.googleClientId);
      setAccessToken(token);
      setStatusMessage({ text: '구글 드라이브에 성공적으로 연결되었습니다!', type: 'success' });
      await loadDriveBackupList(token);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: err.message || 'Google Drive 연결 실패', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 드라이브 백업 파일 목록 조회
  const loadDriveBackupList = async (token: string) => {
    setIsLoading(true);
    try {
      const files = await listDriveBackups(token);
      setDriveBackups(files);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: '백업 목록 조회 실패: ' + err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 지금 구글 드라이브에 백업 업로드
  const handleUploadToDrive = async () => {
    if (!accessToken) {
      await handleConnectGoogleDrive();
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: '서재 데이터를 구글 드라이브에 백업하는 중...', type: 'info' });
    try {
      const backupData: BackupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        authorName: settings.authorName,
        books,
        settings: {
          authorName: settings.authorName,
          theme: settings.theme,
        },
      };

      const res = await uploadBackupToDrive(accessToken, backupData);
      setStatusMessage({ text: `성공적으로 백업되었습니다! (파일명: ${res.name})`, type: 'success' });
      await loadDriveBackupList(accessToken);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: '백업 업로드 실패: ' + err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 드라이브 파일로부터 서재 복원
  const handleRestoreFromDrive = async (fileId: string, fileName: string) => {
    if (!accessToken) return;

    if (!window.confirm(`백업 파일(${fileName})의 내용으로 현재 서재를 복원하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: '구글 드라이브에서 백업 데이터를 다운로드하고 있습니다...', type: 'info' });
    try {
      const backupData = await downloadBackupFromDrive(accessToken, fileId);
      onRestoreBooks(backupData.books, backupData.settings);
      setStatusMessage({
        text: `총 ${backupData.books.length}권의 도서 및 독서 기록, 집필 노트가 성공적으로 복원되었습니다!`,
        type: 'success',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: '복원 실패: ' + err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 로컬 파일로 백업 다운로드
  const handleDownloadLocalJson = () => {
    const jsonStr = exportBackupData(books, settings);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MyLibrary_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 로컬 파일에서 복원
  const handleImportLocalJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const result = importBackupData(content);
        onRestoreBooks(result.books, result.settings);
        setStatusMessage({
          text: `로컬 파일에서 총 ${result.books.length}권의 데이터를 성공적으로 복원했습니다!`,
          type: 'success',
        });
      } catch (err: any) {
        setStatusMessage({ text: '파일 파싱 에러: ' + err.message, type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="modal-container w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-stone-100">
                Google Drive 백업 및 서재 복원 (Cloud Sync)
              </h2>
              <p className="text-xs text-stone-400">
                구글 드라이브에 독서 기록과 집필 노트를 안전하게 백업하고 복원할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* 상태 알림 메시지 */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
              }`}
            >
              {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 구글 드라이브 연동 카드 */}
          <div className="p-5 bg-stone-950/60 border border-stone-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-stone-200">
                    Google Drive 클라우드 연동
                  </h3>
                  <p className="text-xs text-stone-400">
                    {accessToken ? '🟢 구글 계정과 연결되었습니다.' : '구글 드라이브에 안전하게 동기화'}
                  </p>
                </div>
              </div>

              {!settings.googleClientId ? (
                <button
                  onClick={onOpenSettings}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs rounded-lg border border-amber-500/30 flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" /> Client ID 설정 필요
                </button>
              ) : !accessToken ? (
                <button
                  onClick={handleConnectGoogleDrive}
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                  Google Drive 연결
                </button>
              ) : (
                <button
                  onClick={handleUploadToDrive}
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  지금 Google Drive에 백업
                </button>
              )}
            </div>

            {/* 구글 드라이브 백업 파일 목록 */}
            {accessToken && (
              <div className="pt-3 border-t border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold text-stone-300">내 구글 드라이브의 백업 목록</span>
                  <button
                    onClick={() => loadDriveBackupList(accessToken)}
                    className="flex items-center gap-1 text-amber-400 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> 새로고침
                  </button>
                </div>

                {driveBackups.length === 0 ? (
                  <p className="text-xs text-stone-400 py-3 text-center">
                    아직 구글 드라이브에 저장된 백업 파일이 없습니다. [지금 Google Drive에 백업]을 클릭하세요.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {driveBackups.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 bg-stone-900 rounded-lg border border-stone-800 hover:border-amber-500/40 text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileJson className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-stone-200 truncate">{file.name}</p>
                            <p className="text-[10px] text-stone-400">
                              {new Date(file.createdTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRestoreFromDrive(file.id, file.name)}
                          className="px-3 py-1 bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 font-semibold rounded text-xs transition-colors flex items-center gap-1 flex-shrink-0 ml-2"
                        >
                          <DownloadCloud className="w-3 h-3" /> 이 백업으로 복원
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 로컬 파일 백업/복구 (오프라인 수단) */}
          <div className="p-5 bg-stone-950/60 border border-stone-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-serif font-bold text-stone-200">
                로컬 파일 직접 백업 & 복원 (.json)
              </h3>
            </div>
            <p className="text-xs text-stone-400">
              인터넷 연결 없이도 내 PC에 직접 백업 JSON 파일을 저장하거나 복원할 수 있습니다.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={handleDownloadLocalJson}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-amber-400" />
                내 PC로 백업 파일 저장 (.json)
              </button>

              <label className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>백업 파일 선택하여 복원</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportLocalJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
