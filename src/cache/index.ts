import { DatabaseManager } from '../database';
import { BookMetadata, SearchQuery } from '../types';
import crypto from 'crypto';

export class CacheService {
  private db: DatabaseManager;

  constructor() {
    this.db = new DatabaseManager();
  }

  private generateCacheKey(provider: string, query: SearchQuery, pathParams?: Record<string, string>): string {
    const queryString = JSON.stringify({ ...query, ...pathParams });
    return crypto.createHash('md5').update(`${provider}:${queryString}`).digest('hex');
  }

  async get(provider: string, query: SearchQuery, pathParams?: Record<string, string>): Promise<BookMetadata[] | null> {
    const key = this.generateCacheKey(provider, query, pathParams);

    const bookIds = await this.db.getSearchResults(key);
    if (!bookIds || bookIds.length === 0) {
      return null;
    }

    const books = await this.db.getBooksByIds(bookIds);
    return this.convertDbBooksToMetadata(books);
  }

  async set(
    provider: string,
    query: SearchQuery,
    data: BookMetadata[],
    pathParams?: Record<string, string>
  ): Promise<void> {
    const key = this.generateCacheKey(provider, query, pathParams);
    const bookIds: string[] = [];

    for (const book of data) {
      const providerId = book._providerId || this.extractProviderIdFromBook(book, provider);
      const bookId = await this.db.storeBook(provider, providerId, book);
      bookIds.push(bookId);
    }

    await this.db.storeSearchResults(key, provider, bookIds);
  }

  async storeBook(provider: string, book: BookMetadata, providerId?: string): Promise<string> {
    const actualProviderId = providerId || this.extractProviderIdFromBook(book, provider);
    return await this.db.storeBook(provider, actualProviderId, book);
  }

  async getBook(provider: string, providerId: string): Promise<BookMetadata | null> {
    const book = await this.db.getBook(provider, providerId);
    if (!book) return null;

    const books = this.convertDbBooksToMetadata([book]);
    return books[0] || null;
  }

  private extractProviderIdFromBook(book: BookMetadata, provider: string): string {
    if (provider === 'storytel') {
      if (book.isbn) return book.isbn;
      if (book.asin) return book.asin;
    }

    return this.db.generateBookId(book.title, book.subtitle, book.author, book.publisher);
  }

  private convertDbBooksToMetadata(books: any[]): BookMetadata[] {
    return books.map((book) => {
      const metadata: BookMetadata = {
        title: book.title,
        subtitle: book.subtitle,
        author: book.author,
        narrator: book.narrator,
        publisher: book.publisher,
        publishedYear: book.published_year,
        description: book.description,
        cover: book.cover,
        isbn: book.isbn,
        asin: book.asin,
        genres: book.genres,
        tags: book.tags,
        series: book.series,
        language: book.language,
        duration: book.duration,
      };

      Object.keys(metadata).forEach((key) => {
        if ((metadata as any)[key] === null || (metadata as any)[key] === undefined) {
          delete (metadata as any)[key];
        }
      });

      return metadata;
    });
  }

  async clearProvider(provider: string): Promise<void> {
    await this.db.clearProvider(provider);
  }

  async clearExpired(): Promise<void> {
    await this.db.clearExpired();
  }
}
