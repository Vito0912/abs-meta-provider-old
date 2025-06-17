import { Database } from 'sqlite3';
import path from 'path';
import crypto from 'crypto';

export class DatabaseManager {
  private db: Database;
  private readonly defaultTtl: number = 30 * 24 * 60 * 60;

  constructor(dbPath: string = './data/cache.db') {
    this.db = new Database(dbPath);
    this.init();
  }

  private getTtl(): number {
    const envTtl = process.env.CACHE_TTL_SECONDS;
    if (envTtl) {
      const parsed = parseInt(envTtl, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return this.defaultTtl;
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            provider_id TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            author TEXT,
            narrator TEXT,
            publisher TEXT,
            published_year TEXT,
            description TEXT,
            cover TEXT,
            isbn TEXT,
            asin TEXT,
            genres TEXT,
            tags TEXT,
            series TEXT,
            language TEXT,
            duration INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(provider, provider_id)
          )
        `);

        this.db.run(`
          CREATE TABLE IF NOT EXISTS search_cache (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            book_ids TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL
          )
        `);

        // Legacy
        this.db.run(`
          CREATE TABLE IF NOT EXISTS cache (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL
          )
        `);

        this.db.run(`CREATE INDEX IF NOT EXISTS idx_books_provider ON books(provider)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_books_provider_id ON books(provider, provider_id)`);
        this.db.run(
          `CREATE INDEX IF NOT EXISTS idx_search_cache_provider_expires ON search_cache(provider, expires_at)`
        );
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_provider_expires ON cache(provider, expires_at)`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT data FROM cache WHERE id = ? AND expires_at > datetime("now")',
        [key],
        (err: Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row ? JSON.parse(row.data) : null);
        }
      );
    });
  }

  async set<T>(key: string, data: T, provider: string): Promise<void> {
    const ttl = this.getTtl();
    const expiresAt = new Date(Date.now() + ttl * 1000);

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO cache (id, provider, data, expires_at) VALUES (?, ?, ?, ?)',
        [key, provider, JSON.stringify(data), expiresAt.toISOString()],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async clearExpired(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('DELETE FROM cache WHERE expires_at <= datetime("now")');
        this.db.run('DELETE FROM search_cache WHERE expires_at <= datetime("now")', (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async clearProvider(provider: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM cache WHERE provider = ?', [provider], (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async storeBook(provider: string, providerId: string, bookData: any): Promise<string> {
    const bookId = `${provider}:${providerId}`;

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO books (
          id, provider, provider_id, title, subtitle, author, narrator, 
          publisher, published_year, description, cover, isbn, asin, 
          genres, tags, series, language, duration, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))`,
        [
          bookId,
          provider,
          providerId,
          bookData.title,
          bookData.subtitle,
          bookData.author,
          bookData.narrator,
          bookData.publisher,
          bookData.publishedYear,
          bookData.description,
          bookData.cover,
          bookData.isbn,
          bookData.asin,
          bookData.genres ? JSON.stringify(bookData.genres) : null,
          bookData.tags ? JSON.stringify(bookData.tags) : null,
          bookData.series ? JSON.stringify(bookData.series) : null,
          bookData.language,
          bookData.duration,
        ],
        function (err: Error | null) {
          if (err) reject(err);
          else resolve(bookId);
        }
      );
    });
  }

  async getBook(provider: string, providerId: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM books WHERE provider = ? AND provider_id = ?',
        [provider, providerId],
        (err: Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            resolve(null);
            return;
          }

          // Parse JSON fields
          const book = {
            ...row,
            genres: row.genres ? JSON.parse(row.genres) : undefined,
            tags: row.tags ? JSON.parse(row.tags) : undefined,
            series: row.series ? JSON.parse(row.series) : undefined,
          };
          resolve(book);
        }
      );
    });
  }

  async getBooksByIds(bookIds: string[]): Promise<any[]> {
    if (bookIds.length === 0) return [];

    const placeholders = bookIds.map(() => '?').join(',');

    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM books WHERE id IN (${placeholders})`, bookIds, (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const books = rows.map((row) => ({
          ...row,
          genres: row.genres ? JSON.parse(row.genres) : undefined,
          tags: row.tags ? JSON.parse(row.tags) : undefined,
          series: row.series ? JSON.parse(row.series) : undefined,
        }));

        resolve(books);
      });
    });
  }

  async storeSearchResults(searchKey: string, provider: string, bookIds: string[]): Promise<void> {
    const ttl = this.getTtl();
    const expiresAt = new Date(Date.now() + ttl * 1000);

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO search_cache (id, provider, book_ids, expires_at) VALUES (?, ?, ?, ?)',
        [searchKey, provider, JSON.stringify(bookIds), expiresAt.toISOString()],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getSearchResults(searchKey: string): Promise<string[] | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT book_ids FROM search_cache WHERE id = ? AND expires_at > datetime("now")',
        [searchKey],
        (err: Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row ? JSON.parse(row.book_ids) : null);
        }
      );
    });
  }

  generateBookId(title: string, subtitle?: string, author?: string, publisher?: string): string {
    const components = [title, subtitle, author, publisher].filter(Boolean);
    return crypto.createHash('md5').update(components.join('|').toLowerCase()).digest('hex');
  }

  close(): void {
    this.db.close();
  }
}
