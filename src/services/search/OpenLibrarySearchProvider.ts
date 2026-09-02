import { IBookSearchProvider, BookSearchResult } from './types';

/**
 * OpenLibrary 글로벌 오픈 도서 검색 프로바이더 (SRP: OpenLibrary 통신 전담)
 */
export class OpenLibrarySearchProvider implements IBookSearchProvider {
  readonly name = 'OpenLibrary';

  async search(query: string): Promise<BookSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=8`
      );
      if (!res.ok) return [];

      const data = await res.json();
      if (!data.docs || data.docs.length === 0) return [];

      return data.docs.map((doc: any) => ({
        providerName: this.name,
        isbn: doc.isbn ? doc.isbn[0] : (doc.key ? doc.key.replace('/works/', '') : ''),
        title: doc.title || cleanQuery,
        author: doc.author_name ? doc.author_name.join(', ') : '저자 미상',
        publisher: doc.publisher ? doc.publisher[0] : '출판사 미상',
        publishDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
        coverImage: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '',
        description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : `${doc.title} 도서입니다.`,
        category: '일반/학술',
        totalPages: doc.number_of_pages_median || 300,
      }));
    } catch (err) {
      console.warn('[OpenLibrarySearchProvider] Search failed:', err);
      return [];
    }
  }
}
