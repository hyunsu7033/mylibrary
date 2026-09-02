import { Book, ReadingStatus } from '../../types/book';
import { BookSearchResult } from './types';

/**
 * SRP 준수: 외부 검색 DTO를 내부 도메인 Entity(Book)로 변환하는 단일 책임 매퍼
 */
export class BookMapper {
  static toDomainEntity(
    result: BookSearchResult,
    options?: { status?: ReadingStatus; category?: string }
  ): Book {
    const now = new Date().toISOString();
    return {
      id: 'book-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      isbn: result.isbn || 'ISBN-UNKNOWN',
      title: result.title || '제목 없음',
      author: result.author || '저자 미상',
      publisher: result.publisher || '출판사 미상',
      publishDate: result.publishDate || now.slice(0, 10),
      coverImage: result.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      description: result.description || '',
      category: options?.category || result.category || '수학/공학',
      totalPages: result.totalPages || 300,
      currentPage: 0,
      rating: 5,
      status: options?.status || 'reading',
      startDate: now.slice(0, 10),
      tags: [options?.category || result.category || '수학/공학'],
      notes: [],
      aiChatHistory: [],
      writingInsights: [],
      createdAt: now,
      updatedAt: now,
    };
  }
}
