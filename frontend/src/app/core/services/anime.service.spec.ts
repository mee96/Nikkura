import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';

import { makeAnime } from '../../../testing/anime';
import { BlockedContentError } from '../content/content-rules';
import { Anime, Genre, JikanPage } from '../models/jikan.model';
import { AnimeService } from './anime.service';
import { ContentRulesService } from './content-rules.service';
import { JikanService } from './jikan.service';

const GENRES: Genre[] = [
  { mal_id: 9, name: 'Ecchi', count: 1 },
  { mal_id: 12, name: 'Hentai', count: 1 },
  { mal_id: 22, name: 'Romance', count: 1 },
  { mal_id: 49, name: 'Erotica', count: 1 },
];

function page(data: Anime[]): JikanPage<Anime> {
  return {
    data,
    pagination: {
      current_page: 1,
      last_visible_page: 1,
      has_next_page: false,
      items: { count: data.length, total: data.length, per_page: 25 },
    },
  };
}

const safe = makeAnime({ mal_id: 1 });
const hentai = makeAnime({ mal_id: 2, rating: 'Rx - Hentai' });
const ecchi = makeAnime({ mal_id: 3, explicit_genres: [{ mal_id: 9, name: 'Ecchi' }] });

describe('content rules for requests', () => {
  let jikan: {
    getGenres: ReturnType<typeof vi.fn>;
    searchAnime: ReturnType<typeof vi.fn>;
    getCurrentSeason: ReturnType<typeof vi.fn>;
    getAnimeById: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    jikan = {
      getGenres: vi.fn(() => of(GENRES)),
      searchAnime: vi.fn(() => of(page([safe, hentai, ecchi]))),
      getCurrentSeason: vi.fn(() => of(page([hentai, safe]))),
      getAnimeById: vi.fn((id: number) => of([safe, hentai, ecchi].find((a) => a.mal_id === id))),
    };
    TestBed.configureTestingModule({ providers: [{ provide: JikanService, useValue: jikan }] });
  });

  describe('ContentRulesService', () => {
    it('asks for sfw and excludes the explicit genres, resolved by name', async () => {
      const params = await firstValueFrom(TestBed.inject(ContentRulesService).params());

      expect(params).toEqual({ sfw: true, genres_exclude: [12, 49, 9] });
    });

    it('keeps sfw when the genre list cannot be loaded', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      jikan.getGenres.mockReturnValue(throwError(() => new Error('offline')));

      const params = await firstValueFrom(TestBed.inject(ContentRulesService).params());

      expect(params).toEqual({ sfw: true, genres_exclude: [] });
      vi.restoreAllMocks();
    });
  });

  describe('AnimeService', () => {
    it('adds the content params to every search and the caller cannot override them', async () => {
      const service = TestBed.inject(AnimeService);
      const unsafe = { q: 'x', genres: [22], sfw: false } as unknown as Parameters<
        AnimeService['search']
      >[0];

      await firstValueFrom(service.search(unsafe));

      expect(jikan.searchAnime).toHaveBeenCalledWith({
        q: 'x',
        genres: [22],
        sfw: true,
        genres_exclude: [12, 49, 9],
      });
    });

    it('filters search results that slip through', async () => {
      const result = await firstValueFrom(TestBed.inject(AnimeService).search({ q: 'x' }));

      expect(result.data.map((anime) => anime.mal_id)).toEqual([1]);
    });

    it('asks the season with sfw and filters it too', async () => {
      const result = await firstValueFrom(TestBed.inject(AnimeService).currentSeason(2));

      expect(jikan.getCurrentSeason).toHaveBeenCalledWith(2, { sfw: true });
      expect(result.data.map((anime) => anime.mal_id)).toEqual([1]);
    });

    it('returns an allowed anime by id', async () => {
      expect((await firstValueFrom(TestBed.inject(AnimeService).byId(1))).mal_id).toBe(1);
    });

    it.each([2, 3])('refuses anime %i by id', async (id) => {
      await expect(firstValueFrom(TestBed.inject(AnimeService).byId(id))).rejects.toBeInstanceOf(
        BlockedContentError,
      );
    });
  });
});
