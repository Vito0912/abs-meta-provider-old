import { BookMetadata, SeriesMetadata } from '../../types';
import { StorytelBookDetails } from './types';
import { ensureString, upgradeCoverUrl, splitGenre, cleanTitle, extractSubtitle } from './utils';

export class StorytelFormatter {
  formatBookMetadata(bookData: StorytelBookDetails): BookMetadata | null {
    const slb = bookData.slb;
    if (!slb?.book) return null;

    const book = slb.book;
    const abook = slb.abook;
    const ebook = slb.ebook;

    if (!abook && !ebook) return null;

    const seriesInfo = this.extractSeriesInfo(book);
    const seriesName = seriesInfo?.[0]?.series;

    const author = ensureString(book.authorsAsString);
    let cleanedTitle = cleanTitle(book.name, seriesName);
    const { title, subtitle } = extractSubtitle(cleanedTitle);

    const genres = book.category ? splitGenre(ensureString(book.category.title)) : [];

    const metadata: BookMetadata = {
      title: ensureString(title),
      subtitle: subtitle || undefined,
      author: author || undefined,
      language: ensureString(book.language?.isoValue || 'en'),
      genres: genres.length > 0 ? genres : undefined,
      series: seriesInfo || undefined,
      cover: upgradeCoverUrl(book.largeCover),
      duration: this.extractDuration(abook),
      narrator: abook?.narratorAsString || undefined,
      description: ensureString(abook?.description || ebook?.description || ''),
      publisher: ensureString(abook?.publisher?.name || ebook?.publisher?.name || ''),
      publishedYear: this.extractPublishedYear(abook, ebook),
      isbn: ensureString(abook?.isbn || ebook?.isbn || ''),
    };

    return this.cleanMetadata(metadata);
  }

  private extractSeriesInfo(book: any): SeriesMetadata[] | null {
    if (!book.series?.length || !book.seriesOrder) return null;

    return [
      {
        series: ensureString(book.series[0].name),
        sequence: ensureString(book.seriesOrder),
      },
    ];
  }

  private extractDuration(abook: any): number | undefined {
    if (!abook?.length) return undefined;
    return Math.floor(abook.length / 60000);
  }

  private extractPublishedYear(abook: any, ebook: any): string | undefined {
    const dateFormat = abook?.releaseDateFormat || ebook?.releaseDateFormat;
    return dateFormat?.substring(0, 4);
  }

  private cleanMetadata(metadata: BookMetadata): BookMetadata {
    const cleaned = { ...metadata };
    Object.keys(cleaned).forEach((key) => {
      const value = (cleaned as any)[key];
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete (cleaned as any)[key];
      }
    });
    return cleaned;
  }
}
