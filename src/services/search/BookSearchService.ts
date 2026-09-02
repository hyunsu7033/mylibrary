import type { IBookSearchProvider, BookSearchResult } from './types';
import { Yes24SearchProvider } from './Yes24SearchProvider';
import { GoogleBooksSearchProvider } from './GoogleBooksSearchProvider';
import { OpenLibrarySearchProvider } from './OpenLibrarySearchProvider';

/**
 * OCP/SRP 준수: 다중 프로바이더 동시 병렬 검색 오케스트레이터
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
   * 모든 검색 프로바이더를 동시에 병렬 호출하여 풍성한 다중 도서 결과 집계 (최대 30권)
   */
  public async search(query: string): Promise<BookSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    // 모든 프로바이더를 병렬(Parallel)로 동시 실행
    const promises = this.providers.map((p) => p.search(cleanQuery));
    const settled = await Promise.allSettled(promises);

    const combinedResults: BookSearchResult[] = [];

    for (const res of settled) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const item of res.value) {
          if (!item.title) continue;

          // 제목 정규화 (공백/특수문자 제거 후 중복 비교)
          const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
          
          const isDuplicate = combinedResults.some((r) => {
            const rNorm = r.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
            return (
              (r.isbn && item.isbn && r.isbn === item.isbn && r.isbn !== 'ISBN-UNKNOWN') ||
              rNorm === normalizedTitle ||
              (rNorm.includes(normalizedTitle) && Math.abs(rNorm.length - normalizedTitle.length) < 3)
            );
          });

          if (!isDuplicate) {
            combinedResults.push(item);
          }
        }
      }
    }

    if (combinedResults.length > 0) {
      return combinedResults;
    }

    // 모든 프로바이더 실패 시 기본 fallback 템플릿
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
