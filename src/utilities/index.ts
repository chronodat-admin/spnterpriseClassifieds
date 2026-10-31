import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDate(date: Date | string | undefined, pattern = 'PPP'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, pattern) : '';
}

export function formatRelativeDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

export function sanitizeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function parseFiltersJson<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function buildODataFilter(filters: Record<string, string | number | boolean | undefined>): string {
  const parts: string[] = [];
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'string') {
      parts.push(`${key} eq '${value.replace(/'/g, "''")}'`);
    } else if (typeof value === 'boolean') {
      parts.push(`${key} eq ${value}`);
    } else {
      parts.push(`${key} eq ${value}`);
    }
  });
  return parts.join(' and ');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function uniqueBy<T>(items: T[], keyFn: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError ?? new Error('Retry failed');
}

export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
}

export function buildSharePointImageUrl(webUrl: string, serverRelativeUrl: string): string {
  if (serverRelativeUrl.startsWith('http')) return serverRelativeUrl;
  const path = serverRelativeUrl.startsWith('/') ? serverRelativeUrl : `/${serverRelativeUrl}`;
  try {
    return `${new URL(webUrl).origin}${path}`;
  } catch {
    return `${webUrl.replace(/\/$/, '')}${path}`;
  }
}

export function validateListingTitle(title: string): string | undefined {
  if (!title.trim()) return 'Title is required';
  if (title.length < 3) return 'Title must be at least 3 characters';
  if (title.length > 200) return 'Title must not exceed 200 characters';
  return undefined;
}

export function validateListingDescription(description: string): string | undefined {
  if (!description.trim()) return 'Description is required';
  if (description.length < 10) return 'Description must be at least 10 characters';
  if (description.length > 10000) return 'Description must not exceed 10000 characters';
  return undefined;
}

export function validatePrice(price: number, isDonation: boolean): string | undefined {
  if (isDonation) return undefined;
  if (price < 0) return 'Price cannot be negative';
  if (price > 999999999) return 'Price exceeds maximum allowed value';
  return undefined;
}
