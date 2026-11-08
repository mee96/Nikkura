import { ParamMap, Params } from '@angular/router';

import { AnimeQuery } from '../../core/services/anime.service';

/** Jikan `type` values offered as filters, in the order of the design. */
export const ANIME_TYPES = ['tv', 'movie', 'ova', 'ona', 'special'] as const;
export type AnimeType = (typeof ANIME_TYPES)[number];

export const MIN_SCORES = [6, 7, 8] as const;
export type MinScore = (typeof MIN_SCORES)[number];

/** Sort options and the Jikan params behind each one. The first one is the default. */
export const SORTS = {
  popularity: { order_by: 'popularity', sort: 'asc' },
  score: { order_by: 'score', sort: 'desc' },
  newest: { order_by: 'start_date', sort: 'desc' },
  title: { order_by: 'title', sort: 'asc' },
} as const;
export type SortKey = keyof typeof SORTS;
export const SORT_KEYS = Object.keys(SORTS) as SortKey[];
export const DEFAULT_SORT: SortKey = 'popularity';

/** Results per page. Jikan allows up to 25; 24 fills grids of 2, 3, 4 and 6 columns. */
export const PAGE_SIZE = 24;

/**
 * Everything the Explore page shows, read from the URL so a search can be
 * shared, bookmarked and walked through with the back button.
 *
 * `/explore?q=luna&type=tv&genres=romance,fantasy&min_score=7&sort=score&page=2`
 *
 * Genres, themes and demographics share `genres` and are written as slugs of
 * their Jikan names, never ids (ids can change; see GenreService).
 */
export interface ExploreState {
  q: string;
  type: AnimeType | null;
  genres: string[];
  minScore: MinScore | null;
  sort: SortKey;
  page: number;
}

export const EMPTY_STATE: ExploreState = {
  q: '',
  type: null,
  genres: [],
  minScore: null,
  sort: DEFAULT_SORT,
  page: 1,
};

/** Reads the URL. Unknown or broken values fall back to the defaults instead of failing. */
export function parseExploreParams(params: ParamMap): ExploreState {
  const type = params.get('type');
  const minScore = Number(params.get('min_score'));
  const sort = params.get('sort');
  const page = Number(params.get('page'));

  return {
    q: (params.get('q') ?? '').trim(),
    type: (ANIME_TYPES as readonly string[]).includes(type ?? '') ? (type as AnimeType) : null,
    genres: [
      ...new Set(
        (params.get('genres') ?? '')
          .split(',')
          .map((slug) => slug.trim().toLowerCase())
          .filter(Boolean),
      ),
    ],
    minScore: (MIN_SCORES as readonly number[]).includes(minScore) ? (minScore as MinScore) : null,
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : DEFAULT_SORT,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/**
 * Query params for `router.navigate(..., { queryParamsHandling: 'merge' })`.
 * Defaults become `null`, which removes them, so URLs stay short.
 */
export function toQueryParams(changes: Partial<ExploreState>): Params {
  const params: Params = {};
  if ('q' in changes) params['q'] = changes.q?.trim() || null;
  if ('type' in changes) params['type'] = changes.type ?? null;
  if ('genres' in changes)
    params['genres'] = changes.genres?.length ? changes.genres.join(',') : null;
  if ('minScore' in changes) params['min_score'] = changes.minScore ?? null;
  if ('sort' in changes) params['sort'] = changes.sort === DEFAULT_SORT ? null : changes.sort;
  if ('page' in changes) params['page'] = changes.page && changes.page > 1 ? changes.page : null;
  return params;
}

/** How many filters are on (shown on the mobile "Filters · 3" button). The text search is not one. */
export function countFilters(state: ExploreState): number {
  return (state.type ? 1 : 0) + state.genres.length + (state.minScore ? 1 : 0);
}

/**
 * The Jikan query for a state. `idsBySlug` comes from the genre list; slugs it
 * doesn't know are skipped, so an old shared link still works.
 */
export function toAnimeQuery(
  state: ExploreState,
  idsBySlug: ReadonlyMap<string, number>,
): AnimeQuery {
  const genres = state.genres
    .map((slug) => idsBySlug.get(slug))
    .filter((id): id is number => id !== undefined);

  return {
    q: state.q || undefined,
    type: state.type ?? undefined,
    genres,
    min_score: state.minScore ?? undefined,
    ...SORTS[state.sort],
    page: state.page,
    limit: PAGE_SIZE,
  };
}
