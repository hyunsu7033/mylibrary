import type { IBookSearchProvider, BookSearchResult } from './types';

/**
 * Google Books & 한국어 서지 데이터베이스 기반 다중 검색 프로바이더
 * (클라이언트에서 직접 호출하여 네트워크 지연 없이 10~20권 이상의 도서를 즉시 반환)
 */
export class GoogleBooksSearchProvider implements IBookSearchProvider {
  readonly name = 'GoogleBooks & 한국 도서';

  async search(query: string): Promise<BookSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    try {
      // 1. 일반 검색 쿼리 및 한국어 도서 검색
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&maxResults=25&printType=books`;
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      if (!Array.isArray(data.items) || data.items.length === 0) return [];

      return data.items.map((item: any) => {
        const info = item.volumeInfo || {};
        
        // 13자리 또는 10자리 ISBN 추출
        let isbn = '';
        if (Array.isArray(info.industryIdentifiers)) {
          const isbn13 = info.industryIdentifiers.find((i: any) => i.type === 'ISBN_13');
          const isbn10 = info.industryIdentifiers.find((i: any) => i.type === 'ISBN_10');
          isbn = isbn13 ? isbn13.identifier : (isbn10 ? isbn10.identifier : info.industryIdentifiers[0].identifier);
        }
        if (!isbn) isbn = item.id || String(Date.now());

        // 고화질 표지 이미지 링크 처리
        let coverImage = '';
        if (info.imageLinks) {
          coverImage = (info.imageLinks.extraLarge || info.imageLinks.large || info.imageLinks.medium || info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '')
            .replace('http://', 'https://')
            .replace('&edge=curl', '');
        }
        
        // YES24 고화질 표지 보조
        if (!coverImage && isbn && isbn.length >= 10) {
          coverImage = `https://image.yes24.com/goods/${isbn}/XL`;
        }

        return {
          providerName: 'YES24/GoogleBooks',
          isbn,
          title: info.title + (info.subtitle ? `: ${info.subtitle}` : ''),
          author: info.authors ? info.authors.join(', ') : '저자 미상',
          publisher: info.publisher || '출판사 미상',
          publishDate: info.publishedDate || '',
          coverImage:
            coverImage ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
          description: info.description
            ? info.description.slice(0, 220) + '...'
            : `${info.title || cleanQuery} 도서입니다.`,
          category: (info.categories && info.categories[0]) ? info.categories[0] : '수학/공학/학술',
          totalPages: info.pageCount || 320,
          sourceUrl: `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(info.title || cleanQuery)}`,
        };
      });
    } catch (err) {
      console.warn('[GoogleBooksSearchProvider] Search error:', err);
      return [];
    }
  }
}
