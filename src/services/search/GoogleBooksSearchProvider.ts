import type { IBookSearchProvider, BookSearchResult } from './types';

/**
 * Google Books API 기반 도서 검색 프로바이더 (한국어 및 글로벌 도서 지원)
 */
export class GoogleBooksSearchProvider implements IBookSearchProvider {
  readonly name = 'GoogleBooks';

  async search(query: string): Promise<BookSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&maxResults=10&langRestrict=ko`;
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      if (!Array.isArray(data.items) || data.items.length === 0) return [];

      return data.items.map((item: any) => {
        const info = item.volumeInfo || {};
        const isbn =
          info.industryIdentifiers?.[0]?.identifier || item.id || String(Date.now());
        const imageLink = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
        const secureImage = imageLink.replace('http://', 'https://');

        return {
          providerName: this.name,
          isbn,
          title: info.title + (info.subtitle ? `: ${info.subtitle}` : ''),
          author: info.authors ? info.authors.join(', ') : '저자 미상',
          publisher: info.publisher || '출판사 미상',
          publishDate: info.publishedDate || '',
          coverImage:
            secureImage ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
          description: info.description
            ? info.description.slice(0, 200) + '...'
            : `${info.title || cleanQuery} 도서입니다.`,
          category: info.categories?.[0] || '수학/공학',
          totalPages: info.pageCount || 300,
          sourceUrl: info.infoLink || '',
        };
      });
    } catch (err) {
      console.warn('[GoogleBooksSearchProvider] Search error:', err);
      return [];
    }
  }
}
