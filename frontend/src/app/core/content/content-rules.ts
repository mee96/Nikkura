import { Anime, AnimeTag } from '../models/jikan.model';
import { normalizeGenreName } from '../services/genre.service';

/**
 * Nikkura shows no adult content, to anyone (decision of 22 Oct 2026).
 * These are the genres Jikan lists as explicit; they are never requested
 * and never shown. Names only: the ids are looked up at runtime (#9).
 */
export const EXCLUDED_GENRES = ['Hentai', 'Erotica', 'Ecchi'] as const;

/** MyAnimeList rating of hentai ("Rx - Hentai"). */
const BLOCKED_RATING = 'rx';

/** Params added to every Jikan list request. The same for visitors and every user. */
export interface ContentParams {
  sfw: true;
  genres_exclude: number[];
}

const excludedNames = new Set<string>(EXCLUDED_GENRES.map(normalizeGenreName));

function isExcludedTag(tag: AnimeTag): boolean {
  return excludedNames.has(normalizeGenreName(tag.name));
}

/**
 * Second barrier, applied to every result even when the request already had
 * the content params: an anime is hidden if it is rated Rx, if Jikan marks it
 * with an explicit genre, or if any of its tags is an excluded genre.
 */
export function isAllowedAnime(anime: Anime): boolean {
  if (anime.rating?.trim().toLowerCase().startsWith(BLOCKED_RATING)) {
    return false;
  }
  if ((anime.explicit_genres ?? []).length > 0) {
    return false;
  }
  const tags = [...(anime.genres ?? []), ...(anime.themes ?? []), ...(anime.demographics ?? [])];
  return !tags.some(isExcludedTag);
}

/** Error for an anime the content rules do not allow, e.g. opening its page by URL. */
export class BlockedContentError extends Error {
  constructor(readonly animeId: number) {
    super(`Anime ${animeId} is not shown on Nikkura`);
    this.name = 'BlockedContentError';
  }
}
