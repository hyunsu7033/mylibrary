import { Book, ReadingStatus } from '../types/book';
import { defaultBookSearchService } from './search/BookSearchService';
import { BookMapper } from './search/BookMapper';
import { BookSearchResult } from './search/types';

export type Yes24SearchResult = BookSearchResult;

/**
 * OCP/SRP 준수: BookSearchService로 위임
 */
export async function searchYes24Books(query: string): Promise<BookSearchResult[]> {
  return defaultBookSearchService.search(query);
}

/**
 * SRP 준수: BookMapper로 위임
 */
export function convertSearchResultToBook(
  result: BookSearchResult,
  category = '수학/공학',
  status: ReadingStatus = 'reading'
): Book {
  return BookMapper.toDomainEntity(result, { category, status });
}
