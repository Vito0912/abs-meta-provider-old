import { BaseProvider } from '../base';
import { BookMetadata, SearchQuery, ProviderConfig } from '../../types';
import { BookBeatApiService } from './api';
import { BookBeatFormatter } from './formatter';

export class BookBeatProvider extends BaseProvider {
  private apiService: BookBeatApiService;
  private formatter: BookBeatFormatter;
  constructor() {
    const config: ProviderConfig = {
      name: 'bookbeat',
      baseUrl: 'https://www.bookbeat.com/api',
      requiredParams: [],
      optionalParams: ['language'],
      commaSeparatedParams: ['language'],
      parameterWhitelists: {
        language: [
          'at',
          'be',
          'bg',
          'hr',
          'cy',
          'cz',
          'dk',
          'ee',
          'fi',
          'fr',
          'de',
          'gr',
          'hu',
          'ie',
          'it',
          'lv',
          'lt',
          'lu',
          'en',
          'nl',
          'no',
          'pl',
          'pt',
          'ro',
          'sk',
          'si',
          'es',
          'se',
          'ch',
          'gb',
        ],
      },
    };
    super(config);

    this.apiService = new BookBeatApiService();
    this.formatter = new BookBeatFormatter();
  }
  async search(query: SearchQuery, pathParams?: Record<string, string>): Promise<BookMetadata[]> {
    try {
      if (!query.query) {
        console.log('No search query provided');
        return [];
      }
      const language = pathParams?.language;
      const searchQuery = this.buildSearchQuery(query);

      console.log(`Searching BookBeat for: "${searchQuery}"`);
      console.log(`Language(s): ${language}`);

      const searchResponse = await this.apiService.searchBooks(searchQuery, language);
      if (!searchResponse?._embedded?.books?.length) {
        console.log('No books found in BookBeat search');
        return [];
      }

      const books = searchResponse._embedded.books.slice(0, 15);
      console.log(`Found ${books.length} books in BookBeat search results`);

      const results: BookMetadata[] = [];

      for (const book of books) {
        if (!book.id) continue;

        const bookId = book.id.toString();
        console.log(`Processing book ID: ${bookId}`);

        const existingBook = await this.cache.getBook('bookbeat', bookId);
        if (existingBook) {
          existingBook._providerId = bookId;
          existingBook._provider = 'bookbeat';
          results.push(existingBook);
          continue;
        }

        const metadata = this.formatter.formatBookMetadata(book);
        if (!metadata) {
          console.log(`Failed to format metadata for: ${bookId}`);
          continue;
        }

        metadata._providerId = bookId;
        metadata._provider = 'bookbeat';

        await this.cache.storeBook('bookbeat', metadata, bookId);
        console.log(`Stored book in database: ${metadata.title}`);

        results.push(metadata);
      }

      console.log(`Returning ${results.length} books`);
      return results;
    } catch (error) {
      console.error('Error searching BookBeat:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private buildSearchQuery(query: SearchQuery): string {
    let searchTerms: string[] = [];

    if (query.query) {
      const cleanQuery = query.query.split(':')[0].trim();
      searchTerms.push(cleanQuery);
    }

    if (query.author && !query.query?.includes(query.author)) {
      searchTerms.push(query.author);
    }

    if (query.isbn) {
      searchTerms.push(query.isbn);
    }

    return searchTerms.join(' ').trim();
  }
}
