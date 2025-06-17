import axios, { AxiosResponse } from 'axios';
import { StorytelSearchResponse, StorytelBookDetails, StorytelSearchParams, StorytelBookDetailsParams } from './types';

export class StorytelApiService {
  private static readonly BASE_SEARCH_URL = 'https://www.storytel.com/api/search.action';
  private static readonly BASE_BOOK_URL = 'https://www.storytel.com/api/getBookInfoForContent.action';
  private static readonly USER_AGENT = 'abs-meta/1.0';

  async searchBooks(query: string, locale: string): Promise<StorytelSearchResponse | null> {
    try {
      const params: StorytelSearchParams = {
        request_locale: locale,
        q: query.replace(/\s+/g, '+'),
      };

      const response: AxiosResponse<StorytelSearchResponse> = await axios.get(StorytelApiService.BASE_SEARCH_URL, {
        params,
        headers: {
          'User-Agent': StorytelApiService.USER_AGENT,
        },
      });

      if (!response.data || !response.data.books) {
        console.log('No books found in Storytel search');
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error searching Storytel books:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async getBookDetails(bookId: string, locale: string): Promise<StorytelBookDetails | null> {
    try {
      const params: StorytelBookDetailsParams = {
        bookId,
        request_locale: locale,
      };

      const response: AxiosResponse<StorytelBookDetails> = await axios.get(StorytelApiService.BASE_BOOK_URL, {
        params,
        headers: {
          'User-Agent': StorytelApiService.USER_AGENT,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        `Error fetching Storytel book details for ID ${bookId}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return null;
    }
  }
}
