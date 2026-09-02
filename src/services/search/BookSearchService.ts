import type { IBookSearchProvider, BookSearchResult } from './types';
import { Yes24SearchProvider } from './Yes24SearchProvider';
import { GoogleBooksSearchProvider } from './GoogleBooksSearchProvider';
import { OpenLibrarySearchProvider } from './OpenLibrarySearchProvider';

/**
 * OCP 준수: 검색 프로바이더 전략 체인 오케스트레이터
 */
export class BookSearchService {
  private providers: IBookSearchProvider[];

  constructor(providers?: IBookSearchProvider[]) {
    this.providers = providers || [
      new Yes24SearchProvider(),
      new GoogleBooksSearchProvider(),
      new OpenLibrarySearchProvider(),
    ];
  }

  public registerProvider(provider: IBookSearchProvider): void {
    this.providers.push(provider);
  }

  /**
   * 검색어에 대해 등록된 프로바이더들로부터 풍성한 다중 도서 결과 반환
   */
  public async search(query: string): Promise<BookSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    let combinedResults: BookSearchResult[] = [];

    for (const provider of this.providers) {
      try {
        const results = await provider.search(cleanQuery);
        if (results && results.length > 0) {
          // 중복 제목/ISBN 제거하며 병합
          for (const item of results) {
            const isDuplicate = combinedResults.some(
              (r) =>
                (r.isbn && r.isbn === item.isbn) ||
                r.title.toLowerCase() === item.title.toLowerCase()
            );
            if (!isDuplicate) {
              combinedResults.push(item);
            }
          }

          // 이미 8권 이상의 충분한 결과가 확보되면 반환
          if (combinedResults.length >= 8) {
            return combinedResults;
          }
        }
      } catch (err) {
        console.warn(`[BookSearchService] Provider ${provider.name} failed:`, err);
      }
    }

    if (combinedResults.length > 0) {
      return combinedResults;
    }

    // 결과가 없을 때의 기본 템플릿
    return [
      {
        providerName: 'ManualFallback',
        isbn: cleanQuery.replace(/[^0-9X]/gi, '') || '978' + Math.floor(1000000000 + Math.random() * 9000000000),
        title: cleanQuery,
        author: '저자명을 입력해주세요',
        publisher: '출판사명을 입력해주세요',
        publishDate: new Date().toISOString().slice(0, 10),
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        description: `"${cleanQuery}" 도서의 독서 기록입니다.`,
        category: '수학/공학',
        totalPages: 300,
      },
    ];
  }
}

export const defaultBookSearchService = new BookSearchService();
