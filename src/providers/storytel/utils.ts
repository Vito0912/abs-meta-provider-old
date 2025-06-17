export function ensureString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function upgradeCoverUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return `https://storytel.com${url.replace('320x320', '1024x1024')}`;
}

export function splitGenre(genre: string): string[] {
  if (!genre) return [];
  return genre
    .split(/[\/,]/)
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function cleanTitle(title: string, seriesName?: string): string {
  let cleanedTitle = title;

  // Patterns for removing series/episode information from titles
  const patterns = [
    // German patterns
    /^.*?,\s*Folge\s*\d+:\s*/i,
    /^.*?,\s*Band\s*\d+:\s*/i,
    /^.*?\s+-\s+\d+:\s*/i,
    /^.*?\s+\d+:\s*/i,
    /^.*?,\s*Teil\s*\d+:\s*/i,
    /^.*?,\s*Volume\s*\d+:\s*/i,
    /\s*\((Ungekürzt|Gekürzt)\)\s*$/i,
    /,\s*Teil\s+\d+$/i,
    /-\s*.*?(?:Reihe|Serie)\s+\d+$/i,

    // Dutch/Belgian patterns
    /^.*?,\s*Aflevering\s*\d+:\s*/i,
    /^.*?,\s*Deel\s*\d+:\s*/i,

    // Portuguese/Brazilian patterns
    /^.*?,\s*Episódio\s*\d+:\s*/i,
    /^.*?,\s*Parte\s*\d+:\s*/i,

    // Bulgarian patterns
    /^.*?,\s*епизод\s*\d+:\s*/i,
    /^.*?,\s*том\s*\d+:\s*/i,
    /^.*?,\s*част\s*\d+:\s*/i,

    // Spanish patterns
    /^.*?,\s*Episodio\s*\d+:\s*/i,
    /^.*?,\s*Volumen\s*\d+:\s*/i,

    // Danish patterns
    /^.*?,\s*Afsnit\s*\d+:\s*/i,
    /^.*?,\s*Bind\s*\d+:\s*/i,
    /^.*?,\s*Del\s*\d+:\s*/i,

    // Arabic patterns
    /^.*?,\s*حلقة\s*\d+:\s*/i,
    /^.*?,\s*مجلد\s*\d+:\s*/i,
    /^.*?,\s*جزء\s*\d+:\s*/i,

    // Finnish patterns
    /^.*?,\s*Jakso\s*\d+:\s*/i,
    /^.*?,\s*Volyymi\s*\d+:\s*/i,
    /^.*?,\s*Osa\s*\d+:\s*/i,

    // French patterns
    /^.*?,\s*Épisode\s*\d+:\s*/i,
    /^.*?,\s*Tome\s*\d+:\s*/i,
    /^.*?,\s*Partie\s*\d+:\s*/i,

    // Indonesian patterns
    /^.*?,\s*Episode\s*\d+:\s*/i,
    /^.*?,\s*Bagian\s*\d+:\s*/i,

    // Hebrew patterns
    /^.*?,\s*פרק\s*\d+:\s*/i,
    /^.*?,\s*כרך\s*\d+:\s*/i,
    /^.*?,\s*חלק\s*\d+:\s*/i,

    // Hindi patterns
    /^.*?,\s*कड़ी\s*\d+:\s*/i,
    /^.*?,\s*खण्ड\s*\d+:\s*/i,
    /^.*?,\s*भाग\s*\d+:\s*/i,

    // Icelandic patterns
    /^.*?,\s*Þáttur\s*\d+:\s*/i,
    /^.*?,\s*Bindi\s*\d+:\s*/i,
    /^.*?,\s*Hluti\s*\d+:\s*/i,

    // Polish patterns
    /^.*?,\s*Odcinek\s*\d+:\s*/i,
    /^.*?,\s*Tom\s*\d+:\s*/i,
    /^.*?,\s*Część\s*\d+:\s*/i,

    // Swedish patterns
    /^.*?,\s*Avsnitt\s*\d+:\s*/i,
  ];

  patterns.forEach((pattern) => {
    cleanedTitle = cleanedTitle.replace(pattern, '');
  });

  cleanedTitle = cleanedTitle.trim();

  if (seriesName && cleanedTitle.includes(seriesName)) {
    const safeSeriesName = escapeRegex(seriesName);
    const regex = new RegExp(`^(.+?)[-,]\\s*${safeSeriesName}`, 'i');

    const beforeSeriesMatch = cleanedTitle.match(regex);

    if (beforeSeriesMatch) {
      cleanedTitle = beforeSeriesMatch[1].trim();
    }
  }

  return cleanedTitle.trim();
}

export function extractSubtitle(title: string): { title: string; subtitle?: string } {
  if (title.includes(':') || title.includes('-')) {
    const parts = title.split(/[:\-]/);
    if (parts[1] && parts[1].trim().length >= 3) {
      return {
        title: parts[0].trim(),
        subtitle: parts[1].trim(),
      };
    }
  }

  return { title: title.trim() };
}
