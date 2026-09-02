import { Book, AppSettings, BackupData } from '../../types/book';

/**
 * 도서 저장소 추상 인터페이스 (DIP 준수)
 */
export interface IBookRepository {
  getAll(): Book[];
  saveAll(books: Book[]): void;
  getById(id: string): Book | undefined;
  save(book: Book): void;
  delete(id: string): void;
}

/**
 * 환경 설정 저장소 추상 인터페이스 (DIP 준수)
 */
export interface ISettingsRepository {
  getSettings(): AppSettings;
  saveSettings(settings: Partial<AppSettings>): AppSettings;
}

/**
 * 백업 직렬화 추상 인터페이스 (SRP 준수)
 */
export interface IBackupSerializer {
  serialize(books: Book[], settings: AppSettings): string;
  deserialize(rawJson: string): { books: Book[]; settings?: Partial<AppSettings> };
}
