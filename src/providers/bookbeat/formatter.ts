import { BookMetadata, SeriesMetadata } from '../../types';
import { BookBeatBook } from './types';
import { ensureString, cleanDescription } from './utils';

export class BookBeatFormatter {
  formatBookMetadata(book: BookBeatBook): BookMetadata | null {
    try {
      const narrator = book._embedded?.contributors?.find((c) => c.role === 'bb-narrator')?.displayname;

      const publishedYear = book.published ? new Date(book.published).getFullYear().toString() : undefined;

      const description = cleanDescription(book.description);

      const series: SeriesMetadata[] | undefined = book.series
        ? [
            {
              series: ensureString(book.series.name),
              sequence: book.series.partnumber.toString(),
            },
          ]
        : undefined;

      const cover = book.image ? book.image.replace(/\?w=400\b/, '?w=1024') : undefined;

      const metadata: BookMetadata = {
        title: ensureString(book.title),
        author: ensureString(book.author),
        narrator: narrator ? ensureString(narrator) : undefined,
        description: description || undefined,
        cover,
        isbn: book.audiobookisbn || book.ebookisbn || undefined,
        language: ensureString(book.language),
        publishedYear,
        series,
        tags: book.contenttypetags && book.contenttypetags.length > 0 ? book.contenttypetags : undefined,
      };

      return this.cleanMetadata(metadata);
    } catch (error) {
      console.error('Error formatting BookBeat metadata:', error);
      return null;
    }
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
