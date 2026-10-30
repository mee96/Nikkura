import { convertToParamMap } from '@angular/router';

import {
  EMPTY_STATE,
  PAGE_SIZE,
  countFilters,
  parseExploreParams,
  toAnimeQuery,
  toQueryParams,
} from './explore-query';

const parse = (params: Record<string, string>) => parseExploreParams(convertToParamMap(params));

describe('explore query', () => {
  describe('parseExploreParams', () => {
    it('gives the defaults for an empty URL', () => {
      expect(parse({})).toEqual(EMPTY_STATE);
    });

    it('reads every filter', () => {
      expect(
        parse({
          q: '  luna ',
          type: 'movie',
          genres: 'romance,Fantasy',
          min_score: '7',
          sort: 'score',
          page: '3',
        }),
      ).toEqual({
        q: 'luna',
        type: 'movie',
        genres: ['romance', 'fantasy'],
        minScore: 7,
        sort: 'score',
        page: 3,
      });
    });

    it('ignores broken or unknown values instead of failing', () => {
      expect(
        parse({ type: 'manga', min_score: '9', sort: 'random', page: '-2', genres: ',,' }),
      ).toEqual(EMPTY_STATE);
      expect(parse({ page: '2.5' }).page).toBe(1);
    });

    it('drops repeated genres', () => {
      expect(parse({ genres: 'romance,romance, fantasy' }).genres).toEqual(['romance', 'fantasy']);
    });
  });

  describe('toQueryParams', () => {
    it('removes defaults from the URL', () => {
      expect(
        toQueryParams({
          q: ' ',
          type: null,
          genres: [],
          minScore: null,
          sort: 'popularity',
          page: 1,
        }),
      ).toEqual({ q: null, type: null, genres: null, min_score: null, sort: null, page: null });
    });

    it('writes only what changed', () => {
      expect(toQueryParams({ genres: ['romance', 'shoujo'], page: 1 })).toEqual({
        genres: 'romance,shoujo',
        page: null,
      });
      expect(toQueryParams({ sort: 'newest', page: 4 })).toEqual({ sort: 'newest', page: 4 });
    });
  });

  it('counts the filters, not the text', () => {
    expect(countFilters(parse({ q: 'x', type: 'tv', genres: 'a,b', min_score: '8' }))).toBe(4);
    expect(countFilters(parse({ q: 'x' }))).toBe(0);
  });

  describe('toAnimeQuery', () => {
    const ids = new Map([
      ['romance', 22],
      ['shoujo', 25],
    ]);

    it('turns the state into Jikan params, with genre ids from the slugs', () => {
      expect(
        toAnimeQuery(
          parse({ q: 'luna', type: 'tv', genres: 'romance,shoujo', min_score: '7' }),
          ids,
        ),
      ).toEqual({
        q: 'luna',
        type: 'tv',
        genres: [22, 25],
        min_score: 7,
        order_by: 'popularity',
        sort: 'asc',
        page: 1,
        limit: PAGE_SIZE,
      });
    });

    it('skips slugs it does not know, so old links keep working', () => {
      expect(toAnimeQuery(parse({ genres: 'romance,space-opera' }), ids).genres).toEqual([22]);
    });

    it('maps each sort to Jikan', () => {
      expect(toAnimeQuery(parse({ sort: 'score' }), ids)).toMatchObject({
        order_by: 'score',
        sort: 'desc',
      });
      expect(toAnimeQuery(parse({ sort: 'newest' }), ids)).toMatchObject({
        order_by: 'start_date',
        sort: 'desc',
      });
      expect(toAnimeQuery(parse({ sort: 'title' }), ids)).toMatchObject({
        order_by: 'title',
        sort: 'asc',
      });
    });

    it('leaves out empty values', () => {
      expect(toAnimeQuery(EMPTY_STATE, ids)).toMatchObject({
        q: undefined,
        type: undefined,
        min_score: undefined,
        genres: [],
      });
    });
  });
});
