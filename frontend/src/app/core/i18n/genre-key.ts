/**
 * Jikan returns genre, theme and demographic names in English
 * ("Slice of Life", "Idols (Female)"). This turns a name into its
 * translation key, e.g. `genres.slice-of-life`. Pass the name as `fallback`
 * so a genre missing from our table still shows its English name:
 * `{{ genreKey(genre.name) | transloco: { fallback: genre.name } }}`.
 */
export function genreKey(name: string): string {
  return `genres.${genreSlug(name)}`;
}

/** URL-friendly form of a Jikan name: "Slice of Life" → `slice-of-life`. Also used in `?genres=`. */
export function genreSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
