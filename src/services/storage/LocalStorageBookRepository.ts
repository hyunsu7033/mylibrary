import { Book } from '../../types/book';
import { IBookRepository } from './types';
import { INITIAL_BOOKS } from '../storage';

const STORAGE_KEY_BOOKS = 'mylibrary_books_v1';

/**
 * LocalStorage 기반 도서 저장소 구현체 (SRP: 도서 영구 보관 전담)
 */
export class LocalStorageBookRepository implements IBookRepository {
  getAll(): Book[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
      if (!raw) {
        this.saveAll(INITIAL_BOOKS);
        return INITIAL_BOOKS;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error('[LocalStorageBookRepository] Load error', err);
      return INITIAL_BOOKS;
    }
  }

  saveAll(books: Book[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    } catch (err) {
      console.error('[LocalStorageBookRepository] Save error', err);
    }
  }

  getById(id: string): Book | undefined {
    return this.getAll().find((b) => b.id === id);
  }

  save(book: Book): void {
    const all = this.getAll();
    const idx = all.findIndex((b) => b.id === book.id);
    if (idx >= 0) {
      all[idx] = book;
    } else {
      all.unshift(book);
    }
    this.saveAll(all);
  }

  delete(id: string): void {
    const filtered = this.getAll().filter((b) => b.id !== id);
    this.saveAll(filtered);
  }
}
