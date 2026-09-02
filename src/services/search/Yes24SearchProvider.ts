import { IBookSearchProvider, BookSearchResult } from './types';

/**
 * YES24 도서 검색 프로바이더 (SRP: YES24 통신 전담)
 */
export class Yes24SearchProvider implements IBookSearchProvider {
  readonly name = 'YES24';

  async search(query: string): Promise<BookSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`);
      if (!res.ok) {
        throw new Error(`YES24 Serverless API returned status: ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data.items) || data.items.length === 0) {
        return [];
      }

      return data.items.map((item: any) => ({
        providerName: this.name,
        isbn: item.isbn || item.goodsNo || '',
        title: item.title,
        author: item.author || '저자 미상',
        publisher: item.publisher || '출판사 미상',
        publishDate: item.publishDate || '',
        coverImage: item.coverImage || `https://image.yes24.com/goods/${item.goodsNo}/XL`,
        description: item.description || '',
        category: item.category || '수학/공학',
        totalPages: item.totalPages || 300,
        sourceUrl: item.yes24Url,
      }));
    } catch (err) {
      console.warn('[Yes24SearchProvider] Search failed, delegating to next provider:', err);
      return [];
    }
  }
}
