export interface BookSearchResult {
  providerName: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publishDate: string;
  coverImage: string;
  description: string;
  category?: string;
  totalPages?: number;
  sourceUrl?: string;
}

/**
 * OCP 원칙을 준수하는 도서 검색기 전략 인터페이스
 */
export interface IBookSearchProvider {
  readonly name: string;
  search(query: string): Promise<BookSearchResult[]>;
}
