import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { makeAnime } from '../../../testing/anime';
import { BlockedContentError } from '../content/content-rules';
import { Anime, Genre, JikanPage } from '../models/jikan.model';
import { AnimeService } from './anime.service';
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
const erotica = makeAnime({ mal_id: 3, explicit_genres: [{ mal_id: 49, name: 'Erotica' }] });
const ecchi = makeAnime({ mal_id: 4, explicit_genres: [{ mal_id: 9, name: 'Ecchi' }] });

describe('AnimeService', () => {
  let jikan: {
    getGenres: ReturnType<typeof vi.fn>;
    searchAnime: ReturnType<typeof vi.fn>;
    getCurrentSeason: ReturnType<typeof vi.fn>;
    getAnimeById: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    jikan = {
      getGenres: vi.fn(() => of(GENRES)),
      searchAnime: vi.fn(() => of(page([safe, hentai, erotica, ecchi]))),
      getCurrentSeason: vi.fn(() => of(page([hentai, safe]))),
      getAnimeById: vi.fn((id: number) =>
        of([safe, hentai, erotica, ecchi].find((a) => a.mal_id === id)),
      ),
    };
    TestBed.configureTestingModule({ providers: [{ provide: JikanService, useValue: jikan }] });
  });

  describe('content rules', () => {
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
        genres_exclude: [12, 49],
      });
    });

    it('filters hentai and erotica that slip through, and keeps ecchi', async () => {
      const result = await firstValueFrom(TestBed.inject(AnimeService).search({ q: 'x' }));

      expect(result.data.map((anime) => anime.mal_id)).toEqual([1, 4]);
    });

    it('asks the season with sfw and filters it too', async () => {
      const result = await firstValueFrom(TestBed.inject(AnimeService).currentSeason(2));

      expect(jikan.getCurrentSeason).toHaveBeenCalledWith(2, { sfw: true });
      expect(result.data.map((anime) => anime.mal_id)).toEqual([1]);
    });

    it.each([1, 4])('returns allowed anime %i by id, ecchi included', async (id) => {
      expect((await firstValueFrom(TestBed.inject(AnimeService).byId(id))).mal_id).toBe(id);
    });

    it.each([2, 3])('refuses anime %i by id', async (id) => {
      await expect(firstValueFrom(TestBed.inject(AnimeService).byId(id))).rejects.toBeInstanceOf(
        BlockedContentError,
      );
    });
  });
});
