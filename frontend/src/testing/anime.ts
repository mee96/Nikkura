import { Anime, AnimeTag } from '../app/core/models/jikan.model';

/** Builders for Jikan data in unit tests. */
export const tag = (name: string, mal_id = 1): AnimeTag => ({ mal_id, name });

/** A safe anime (PG-13 shoujo romance); override only what the test is about. */
export function makeAnime(overrides: Partial<Anime> = {}): Anime {
  return {
    mal_id: 1,
    title: 'Sample',
    title_english: null,
    title_japanese: null,
    images: {
      jpg: { image_url: null, large_image_url: null },
      webp: { image_url: null, large_image_url: null },
    },
    type: 'TV',
    episodes: 12,
    status: 'Finished Airing',
    airing: false,
    rating: 'PG-13 - Teens 13 or older',
    score: 8,
    scored_by: 100,
    rank: 1,
    popularity: 1,
    synopsis: null,
    season: null,
    year: null,
    genres: [tag('Romance')],
    explicit_genres: [],
    themes: [],
    demographics: [tag('Shoujo')],
    ...overrides,
  };
}
