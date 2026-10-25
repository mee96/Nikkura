/**
 * Jikan returns genre, theme and demographic names in English
 * ("Slice of Life", "Idols (Female)"). This turns a name into its
 * translation key, e.g. `genres.slice-of-life`, so the template can do
 * `{{ genreKey(genre.name) | transloco }}`.
 */
export function genreKey(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `genres.${slug}`;
}
