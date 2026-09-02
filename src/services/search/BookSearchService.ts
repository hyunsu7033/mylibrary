import { IBookSearchProvider, BookSearchResult } from './types';
import { Yes24SearchProvider } from './Yes24SearchProvider';
import { OpenLibrarySearchProvider } from './OpenLibrarySearchProvider';

/**
 * OCP 준수: 검색 프로바이더 전략 체인 오케스트레이터
 */
export class BookSearchService {
  private providers: IBookSearchProvider[];

  constructor(providers?: IBookSearchProvider[]) {
    this.providers = providers || [
      new Yes24SearchProvider(),
      new OpenLibrarySearchProvider(),
    ];
  }

  /**
   * 새로운 검색 프로바이더를 기존 코드 수정 없이 동적으로 추가 (OCP)
   */
  public registerProvider(provider: IBookSearchProvider): void {
    this.providers.push(provider);
  }

  /**
   * 등록된 프로바이더 순서대로 검색을 수행 (Fallback Chain)
   */
  public async search(query: string): Promise<BookSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    for (const provider of this.providers) {
      try {
        const results = await provider.search(cleanQuery);
        if (results && results.length > 0) {
          return results;
        }
      } catch (err) {
        console.warn(`[BookSearchService] Provider ${provider.name} failed:`, err);
      }
    }

    // 모든 프로바이더에서 결과를 찾지 못했을 때의 안전한 폴백 템플릿 반환
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

// 싱글톤 기본 인스턴스 export
export const defaultBookSearchService = new BookSearchService();
