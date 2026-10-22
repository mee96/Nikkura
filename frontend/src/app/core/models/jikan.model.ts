/**
 * Minimal typings for the parts of the Jikan v4 API that Nikkura uses.
 * Field names mirror the API (snake_case) so responses need no mapping.
 * Add fields here only when a screen needs them.
 */

/** Pagination block that comes with every list endpoint. */
export interface JikanPagination {
  current_page: number;
  last_visible_page: number;
  has_next_page: boolean;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

/** A paginated list response, e.g. `/anime` or `/seasons/now`. */
export interface JikanPage<T> {
  data: T[];
  pagination: JikanPagination;
}

/** A response with a single resource, e.g. `/anime/{id}`. */
export interface JikanItem<T> {
  data: T;
}

/** A response with a plain list and no pagination, e.g. `/genres/anime`. */
export interface JikanList<T> {
  data: T[];
}

/** Genre, theme or demographic as embedded in an anime. */
export interface AnimeTag {
  mal_id: number;
  name: string;
}

/** Entry of `/genres/anime`. Jikan returns genres, themes and demographics together. */
export interface Genre extends AnimeTag {
  count: number;
}

export interface AnimeImage {
  image_url: string | null;
  large_image_url: string | null;
}

export interface Anime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  images: {
    jpg: AnimeImage;
    webp: AnimeImage;
  };
  type: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  rating: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  synopsis: string | null;
  season: string | null;
  year: number | null;
  genres: AnimeTag[];
  themes: AnimeTag[];
  demographics: AnimeTag[];
}

/** Query params accepted by `GET /anime`. Arrays are sent comma-separated. */
export interface AnimeSearchParams {
  q?: string;
  page?: number;
  limit?: number;
  type?: string;
  min_score?: number;
  /** Genre, theme and demographic ids share the same filter in Jikan. */
  genres?: number[];
  order_by?: string;
  sort?: 'asc' | 'desc';
}
