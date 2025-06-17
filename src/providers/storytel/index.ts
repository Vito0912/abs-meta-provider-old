import { BaseProvider } from '../base';
import { BookMetadata, SearchQuery, ProviderConfig } from '../../types';
import { StorytelApiService } from './api';
import { StorytelFormatter } from './formatter';

export class StorytelProvider extends BaseProvider {
  private apiService: StorytelApiService;
  private formatter: StorytelFormatter;

  constructor() {
    const config: ProviderConfig = {
      name: 'storytel',
      baseUrl: 'https://www.storytel.com/api',
      requiredParams: ['language'],
      optionalParams: [],
      parameterWhitelists: {
        language: [
          'en',
          'sv',
          'no',
          'dk',
          'fi',
          'is',
          'de',
          'es',
          'fr',
          'it',
          'pl',
          'nl',
          'pt',
          'bg',
          'tr',
          'ru',
          'ar',
          'hi',
          'id',
          'th',
        ],
      },
    };
    super(config);

    this.apiService = new StorytelApiService();
    this.formatter = new StorytelFormatter();
  }

  async search(query: SearchQuery, pathParams?: Record<string, string>): Promise<BookMetadata[]> {
    try {
      if (!query.query) {
        console.log('No search query provided');
        return [];
      }

      const locale = pathParams?.language || 'en';
      const searchQuery = this.buildSearchQuery(query);

      console.log(`Searching Storytel for: "${searchQuery}"`);
      const searchResponse = await this.apiService.searchBooks(searchQuery, locale);
      if (!searchResponse?.books?.length) {
        console.log('No books found in Storytel search');
        return [];
      }

      const books = searchResponse.books.slice(0, 5);
      console.log(`Found ${books.length} books in Storytel search results`);

      const results: BookMetadata[] = [];
      for (const book of books) {
        if (!book.book?.id) continue;

        const bookId = book.book.id;
        console.log(`Processing book ID: ${bookId}`);

        const existingBook = await this.cache.getBook('storytel', bookId);
        if (existingBook) {
          existingBook._providerId = bookId;
          existingBook._provider = 'storytel';
          results.push(existingBook);
          continue;
        }

        const bookDetails = await this.apiService.getBookDetails(bookId, locale);
        if (!bookDetails) {
          console.log(`Failed to fetch details for: ${bookId}`);
          continue;
        }

        const metadata = this.formatter.formatBookMetadata(bookDetails);
        if (!metadata) {
          console.log(`Failed to format metadata for: ${bookId}`);
          continue;
        }

        metadata._providerId = bookId;
        metadata._provider = 'storytel';

        await this.cache.storeBook('storytel', metadata, bookId);
        console.log(`Stored book in database: ${metadata.title}`);

        results.push(metadata);
      }

      console.log(`Returning ${results.length} books`);
      return results;
    } catch (error) {
      console.error('Error searching Storytel:', error instanceof Error ? error.message : 'Unknown error');
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
