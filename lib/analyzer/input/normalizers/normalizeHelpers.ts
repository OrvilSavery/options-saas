export function normalizeTicker(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeOptionalNumber(value: number | null): number | null {
  if (value === null) return null;
  return Number.isFinite(value) ? value : null;
}

export function normalizeRoundedNumber(value: number): number {
  return Number(value.toFixed(2));
}