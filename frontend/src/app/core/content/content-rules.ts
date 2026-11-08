import { Anime, AnimeTag } from '../models/jikan.model';
import { normalizeGenreName } from '../services/genre.service';

/**
 * The only thing Nikkura never shows is hentai, to anyone (decisions of 22 Oct,
 * 26 Oct and 3 Nov 2026). Names only: the ids are looked up at runtime (#9).
 *
 * - Excluded: hentai is never requested and never shown, whether it is tagged
 *   Hentai or rated Rx.
 * - Mature: ecchi and erotica are shown, with a +18 mark. Jikan lists them as
 *   explicit too, but they are not hentai.
 */
export const EXCLUDED_GENRES = ['Hentai'] as const;
export const MATURE_GENRES = ['Ecchi', 'Erotica'] as const;

/** MyAnimeList rating of hentai ("Rx - Hentai"). */
const BLOCKED_RATING = 'rx';

/**
 * Params added to every Jikan search. The same for visitors and every user.
 * Jikan's own `sfw` filter is not used: the rule is only about hentai, which
 * we exclude by genre and check again on our side.
 */
export interface ContentParams {
  genres_exclude: number[];
}

const excludedNames = new Set<string>(EXCLUDED_GENRES.map(normalizeGenreName));
const matureNames = new Set<string>(MATURE_GENRES.map(normalizeGenreName));

/** True for a genre that is never shown (hentai). */
export function isExcludedGenreName(name: string): boolean {
  return excludedNames.has(normalizeGenreName(name));
}

/** True for a genre shown with the +18 mark (ecchi, erotica). */
export function isMatureGenreName(name: string): boolean {
  return matureNames.has(normalizeGenreName(name));
}

function allTags(anime: Anime): AnimeTag[] {
  return [
    ...(anime.genres ?? []),
    ...(anime.explicit_genres ?? []),
    ...(anime.themes ?? []),
    ...(anime.demographics ?? []),
  ];
}

function hasTagIn(anime: Anime, names: ReadonlySet<string>): boolean {
  return allTags(anime).some((tag) => names.has(normalizeGenreName(tag.name)));
}

/**
 * Second barrier, applied to every result even when the request already had
 * the content params: an anime is hidden if it is rated Rx or if any of its
 * genres, explicit genres, themes or demographics is an excluded genre.
 */
export function isAllowedAnime(anime: Anime): boolean {
  if (anime.rating?.trim().toLowerCase().startsWith(BLOCKED_RATING)) {
    return false;
  }
  return !hasTagIn(anime, excludedNames);
}

/** True when the anime is shown with the +18 mark (it has a mature genre: ecchi or erotica). */
export function isMatureAnime(anime: Anime): boolean {
  return hasTagIn(anime, matureNames);
}

/** Error for an anime the content rules do not allow, e.g. opening its page by URL. */
export class BlockedContentError extends Error {
  constructor(readonly animeId: number) {
    super(`Anime ${animeId} is not shown on Nikkura`);
    this.name = 'BlockedContentError';
  }
}
