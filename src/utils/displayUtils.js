/**
 * Safe display for UI: missing/empty text -> "-", missing number -> 0.
 * Use for rendering DB data so UI never crashes and stays consistent.
 */
export function safeDisplay(value, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value) && value.length === 0) return fallback;
  if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return fallback;
  return value;
}

export function safeNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
