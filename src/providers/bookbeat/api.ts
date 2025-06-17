import axios, { AxiosResponse } from 'axios';
import { BookBeatSearchResponse, BookBeatSearchParams } from './types';

export class BookBeatApiService {
  private static readonly BASE_URL = 'https://www.bookbeat.com/api/next/search';
  private static readonly USER_AGENT = 'abs-meta/1.0';
  private static readonly LANGUAGE_MAP: Record<string, string> = {
    at: 'german',
    be: 'dutch',
    bg: 'bulgarian',
    hr: 'croatian',
    cy: 'greek',
    cz: 'czech',
    dk: 'danish',
    ee: 'estonian',
    fi: 'finnish',
    fr: 'french',
    de: 'german',
    gr: 'greek',
    hu: 'hungarian',
    ie: 'english',
    it: 'italian',
    lv: 'latvian',
    lt: 'lithuanian',
    lu: 'french',
    en: 'english',
    nl: 'dutch',
    no: 'norwegian',
    pl: 'polish',
    pt: 'portuguese',
    ro: 'romanian',
    sk: 'slovak',
    si: 'slovenian',
    es: 'spanish',
    se: 'swedish',
    ch: 'german',
    gb: 'english',
  };
  async searchBooks(query: string, languages: string | undefined): Promise<BookBeatSearchResponse | null> {
    try {
      const url = new URL(BookBeatApiService.BASE_URL);
      url.searchParams.set('query', query);

      if (languages) {
        const languageList = languages.split(',').map((lang) => lang.trim());

        for (const lang of languageList) {
          const bookbeatLanguage = BookBeatApiService.LANGUAGE_MAP[lang];
          if (bookbeatLanguage) {
            url.searchParams.append('language', bookbeatLanguage);
          }
        }
      }

      const response: AxiosResponse<BookBeatSearchResponse> = await axios.get(url.toString(), {
        headers: {
          'User-Agent': BookBeatApiService.USER_AGENT,
        },
      });

      return response.data;
    } catch (error) {
      console.error('BookBeat API error:', error);
      return null;
    }
  }
}
