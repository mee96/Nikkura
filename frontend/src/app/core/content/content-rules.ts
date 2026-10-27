import { Anime, AnimeTag } from '../models/jikan.model';
import { normalizeGenreName } from '../services/genre.service';

/**
 * Nikkura shows no sexual content, to anyone (decisions of 22 and 26 Oct 2026).
 * Names only: the ids are looked up at runtime (#9).
 *
 * - Excluded: hentai and erotica are never requested and never shown.
 * - Mature: ecchi is shown, with a +18 mark. Jikan lists it as explicit too,
 *   but it is suggestive content without sex.
 */
export const EXCLUDED_GENRES = ['Hentai', 'Erotica'] as const;
export const MATURE_GENRES = ['Ecchi'] as const;

/** MyAnimeList rating of hentai ("Rx - Hentai"). */
const BLOCKED_RATING = 'rx';

/** Params added to every Jikan list request. The same for visitors and every user. */
export interface ContentParams {
  sfw: true;
  genres_exclude: number[];
}

const excludedNames = new Set<string>(EXCLUDED_GENRES.map(normalizeGenreName));
const matureNames = new Set<string>(MATURE_GENRES.map(normalizeGenreName));

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

/** True when the anime is shown with the +18 mark (it has a mature genre: ecchi). */
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
