const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Formats a date as yyyy-MM-dd in local time (toISOString would shift it to UTC). */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses yyyy-MM-dd into a local Date at midnight. Returns null for anything invalid. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  const match = value ? ISO_DATE.exec(value) : null;
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  // Rejects things like 2026-02-31 which Date would happily roll over.
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Number of calendar days between two dates, ignoring the time of day. */
export function dayDifference(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86_400_000);
}
