export function ensureString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function cleanDescription(description: string): string {
  if (!description) return '';
  return description.replace(/<[^>]*>/g, '').trim();
}
