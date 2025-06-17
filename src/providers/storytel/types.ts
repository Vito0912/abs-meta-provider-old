export interface StorytelLanguage {
  isoValue: string;
}

export interface StorytelPublisher {
  name: string;
}

export interface StorytelCategory {
  title: string;
}

export interface StorytelSeries {
  name: string;
}

export interface StorytelAudiobook {
  isbn?: string;
  description?: string;
  publisher?: StorytelPublisher;
  releaseDateFormat?: string;
  length?: number;
  narratorAsString?: string;
}

export interface StorytelEbook {
  isbn?: string;
  description?: string;
  publisher?: StorytelPublisher;
  releaseDateFormat?: string;
}

export interface StorytelBook {
  id: string;
  name: string;
  authorsAsString?: string;
  language?: StorytelLanguage;
  category?: StorytelCategory;
  series?: StorytelSeries[];
  seriesOrder?: string;
  largeCover?: string;
}

export interface StorytelBookDetails {
  slb: {
    book: StorytelBook;
    abook?: StorytelAudiobook;
    ebook?: StorytelEbook;
  };
}

export interface StorytelSearchResult {
  book: StorytelBook;
}

export interface StorytelSearchResponse {
  books: StorytelSearchResult[];
}

export interface StorytelSearchParams {
  request_locale: string;
  q: string;
}

export interface StorytelBookDetailsParams {
  bookId: string;
  request_locale: string;
}
