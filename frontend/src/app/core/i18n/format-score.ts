/** "8,7" in Catalan and Spanish, "8.7" in English. `null` when the anime has no score yet. */
export function formatScore(score: number | null | undefined, lang: string): string | null {
  if (score === null || score === undefined) {
    return null;
  }
  return new Intl.NumberFormat(lang, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(score);
}
