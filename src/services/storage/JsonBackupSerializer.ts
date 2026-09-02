import { Book, AppSettings, BackupData } from '../../types/book';
import { IBackupSerializer } from './types';

/**
 * SRP 준수: 백업 데이터 JSON 직렬화 및 유효성 검증 전담 클래스
 */
export class JsonBackupSerializer implements IBackupSerializer {
  serialize(books: Book[], settings: AppSettings): string {
    const backup: BackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      authorName: settings.authorName || '학술 연구자',
      books,
      settings: {
        authorName: settings.authorName,
        theme: settings.theme,
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  deserialize(rawJson: string): { books: Book[]; settings?: Partial<AppSettings> } {
    const parsed = JSON.parse(rawJson) as BackupData;
    if (!parsed || !Array.isArray(parsed.books)) {
      throw new Error('올바른 백업 데이터 형식이 아닙니다. (books 배열 누락)');
    }
    return {
      books: parsed.books,
      settings: parsed.settings,
    };
  }
}
