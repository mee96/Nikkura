import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Anime, Genre, JikanPage } from '../models/jikan.model';
import {
  JIKAN_CACHE_TTL_MS,
  JIKAN_REQUEST_INTERVAL_MS,
  JIKAN_RETRY_BASE_DELAY_MS,
  JikanService,
} from './jikan.service';

const BASE = environment.jikanUrl;
const TOO_MANY_REQUESTS = { status: 429, statusText: 'Too Many Requests' };
const SERVER_ERROR = { status: 500, statusText: 'Internal Server Error' };

const genres: Genre[] = [
  { mal_id: 1, name: 'Action', count: 10 },
  { mal_id: 2, name: 'Adventure', count: 8 },
];

function seasonPage(page: number): JikanPage<Anime> {
  return {
    data: [],
    pagination: {
      current_page: page,
      last_visible_page: 3,
      has_next_page: page < 3,
      items: { count: 0, total: 0, per_page: 25 },
    },
  };
}

describe('JikanService', () => {
  let service: JikanService;
  let http: HttpTestingController;

  /** Moves the fake clock; the queue and the retries both run on timers. */
  const tick = (ms: number) => vi.advanceTimersByTime(ms);

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(JikanService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  describe('methods', () => {
    it('searches anime and sends the filters as query params', () => {
      let result: JikanPage<Anime> | undefined;
      service
        .searchAnime({ q: 'naruto', page: 2, min_score: 7, genres: [1, 2] })
        .subscribe((page) => (result = page));
      tick(1);

      const req = http.expectOne((r) => r.url === `${BASE}/anime`);
      expect(req.request.params.get('q')).toBe('naruto');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('min_score')).toBe('7');
      expect(req.request.params.get('genres')).toBe('1,2');

      const page = seasonPage(2);
      req.flush(page);
      expect(result).toEqual(page);
    });

    it('does not send empty params', () => {
      service.searchAnime({ q: '', genres: [], page: 1 }).subscribe();
      tick(1);

      const req = http.expectOne((r) => r.url === `${BASE}/anime`);
      expect(req.request.params.keys()).toEqual(['page']);
      req.flush(seasonPage(1));
    });

    it('gets an anime by id and returns the anime, not the wrapper', () => {
      let result: Anime | undefined;
      service.getAnimeById(5114).subscribe((anime) => (result = anime));
      tick(1);

      const anime = { mal_id: 5114, title: 'Fullmetal Alchemist: Brotherhood' } as Anime;
      http.expectOne(`${BASE}/anime/5114`).flush({ data: anime });

      expect(result).toEqual(anime);
    });

    it('gets the genres as a plain list', () => {
      let result: Genre[] | undefined;
      service.getGenres().subscribe((list) => (result = list));
      tick(1);

      http.expectOne(`${BASE}/genres/anime`).flush({ data: genres });

      expect(result).toEqual(genres);
    });

    it('gets the current season by page, starting at page 1', () => {
      service.getCurrentSeason().subscribe();
      tick(1);

      const req = http.expectOne((r) => r.url === `${BASE}/seasons/now`);
      expect(req.request.params.get('page')).toBe('1');
      req.flush(seasonPage(1));
    });
  });

  describe('cache', () => {
    it('does not repeat the call for genres once they are cached', () => {
      service.getGenres().subscribe();
      tick(1);
      http.expectOne(`${BASE}/genres/anime`).flush({ data: genres });

      let result: Genre[] | undefined;
      service.getGenres().subscribe((list) => (result = list));
      tick(JIKAN_REQUEST_INTERVAL_MS * 2);

      http.expectNone(`${BASE}/genres/anime`);
      expect(result).toEqual(genres);
    });

    it('shares one call between equal requests made at the same time', () => {
      const results: Genre[][] = [];
      service.getGenres().subscribe((list) => results.push(list));
      service.getGenres().subscribe((list) => results.push(list));
      tick(JIKAN_REQUEST_INTERVAL_MS * 2);

      http.expectOne(`${BASE}/genres/anime`).flush({ data: genres });

      expect(results).toEqual([genres, genres]);
    });

    it('caches each page of the season on its own', () => {
      service.getCurrentSeason(1).subscribe();
      service.getCurrentSeason(2).subscribe();
      service.getCurrentSeason(1).subscribe();
      tick(JIKAN_REQUEST_INTERVAL_MS * 2);

      const requests = http.match((r) => r.url === `${BASE}/seasons/now`);
      expect(requests.map((r) => r.request.params.get('page'))).toEqual(['1', '2']);
      requests.forEach((r) => r.flush(seasonPage(1)));
    });

    it('asks again once the cache has expired', () => {
      service.getGenres().subscribe();
      tick(1);
      http.expectOne(`${BASE}/genres/anime`).flush({ data: genres });

      tick(JIKAN_CACHE_TTL_MS + 1);
      service.getGenres().subscribe();
      tick(1);

      http.expectOne(`${BASE}/genres/anime`).flush({ data: genres });
    });

    it('does not cache a failed call', () => {
      service.getGenres().subscribe({ error: () => undefined });
      tick(1);
      http.expectOne(`${BASE}/genres/anime`).flush(null, SERVER_ERROR);

      service.getGenres().subscribe();
      tick(JIKAN_REQUEST_INTERVAL_MS * 2);

      http.expectOne(`${BASE}/genres/anime`).flush({ data: genres });
    });

    it('does not cache searches or single anime', () => {
      service.getAnimeById(1).subscribe();
      tick(1);
      http.expectOne(`${BASE}/anime/1`).flush({ data: {} });

      service.getAnimeById(1).subscribe();
      tick(JIKAN_REQUEST_INTERVAL_MS * 2);
      http.expectOne(`${BASE}/anime/1`).flush({ data: {} });
    });
  });

  describe('rate limiting (429)', () => {
    it('retries after a 429 and delivers the result when it works', () => {
      let result: Genre[] | undefined;
      let failed = false;
      service.getGenres().subscribe({
        next: (list) => (result = list),
        error: () => (failed = true),
      });
      tick(1);
      http.expectOne(`${BASE}/genres/anime`).flush(null, TOO_MANY_REQUESTS);

      // Nothing leaves before the backoff is over.
      tick(JIKAN_RETRY_BASE_DELAY_MS - 10);
      http.expectNone(`${BASE}/genres/anime`);

      tick(10 + 1);
      http.expectOne(`${BASE}/genres/anime`).flush({ data: genres });

      expect(failed).toBe(false);
      expect(result).toEqual(genres);
    });

    it('doubles the wait on every retry: 1 s, 2 s, 4 s', () => {
      let result: Genre[] | undefined;
      service.getGenres().subscribe((list) => (result = list));
      tick(1);

      for (const wait of [1000, 2000, 4000]) {
        http.expectOne(`${BASE}/genres/anime`).flush(null, TOO_MANY_REQUESTS);

        tick(wait - 10);
        http.expectNone(`${BASE}/genres/anime`);
        tick(10 + 1);
      }

      http.expectOne(`${BASE}/genres/anime`).flush({ data: genres });
      expect(result).toEqual(genres);
    });

    it('gives up after 3 retries and passes the 429 on as a normal error', () => {
      let status: number | undefined;
      service.getGenres().subscribe({ error: (error) => (status = error.status) });
      tick(1);

      for (const wait of [1000, 2000, 4000]) {
        http.expectOne(`${BASE}/genres/anime`).flush(null, TOO_MANY_REQUESTS);
        tick(wait + 1);
      }
      http.expectOne(`${BASE}/genres/anime`).flush(null, TOO_MANY_REQUESTS);

      expect(status).toBe(429);
      tick(60_000);
      http.expectNone(`${BASE}/genres/anime`);
    });
  });

  describe('other errors', () => {
    it('does not retry a 500: it passes it on at once', () => {
      let status: number | undefined;
      service.getAnimeById(1).subscribe({ error: (error) => (status = error.status) });
      tick(1);

      http.expectOne(`${BASE}/anime/1`).flush(null, SERVER_ERROR);
      expect(status).toBe(500);

      tick(60_000);
      http.expectNone(`${BASE}/anime/1`);
    });

    it('does not retry a 404', () => {
      let status: number | undefined;
      service.getAnimeById(999999).subscribe({ error: (error) => (status = error.status) });
      tick(1);

      http.expectOne(`${BASE}/anime/999999`).flush(null, { status: 404, statusText: 'Not Found' });
      expect(status).toBe(404);

      tick(60_000);
      http.expectNone(`${BASE}/anime/999999`);
    });
  });

  describe('request queue', () => {
    it('spaces requests made together, one every interval', () => {
      for (const id of [1, 2, 3, 4]) {
        service.getAnimeById(id).subscribe();
      }

      // The first one leaves right away, the rest wait their turn.
      tick(1);
      expect(http.match((r) => r.url.startsWith(`${BASE}/anime/`))).toHaveLength(1);

      tick(JIKAN_REQUEST_INTERVAL_MS - 10);
      expect(http.match((r) => r.url.startsWith(`${BASE}/anime/`))).toHaveLength(0);

      tick(10);
      expect(http.match((r) => r.url.startsWith(`${BASE}/anime/`))).toHaveLength(1);

      tick(JIKAN_REQUEST_INTERVAL_MS);
      expect(http.match((r) => r.url.startsWith(`${BASE}/anime/`))).toHaveLength(1);

      tick(JIKAN_REQUEST_INTERVAL_MS);
      expect(http.match((r) => r.url.startsWith(`${BASE}/anime/`))).toHaveLength(1);
    });

    it('never sends more than 3 requests in any second', () => {
      for (let id = 1; id <= 10; id++) {
        service.getAnimeById(id).subscribe();
      }

      const sentAt: number[] = [];
      for (let ms = 0; ms <= 4000; ms++) {
        tick(1);
        http.match((r) => r.url.startsWith(`${BASE}/anime/`)).forEach(() => sentAt.push(ms));
      }

      expect(sentAt).toHaveLength(10);
      for (let i = 3; i < sentAt.length; i++) {
        expect(sentAt[i] - sentAt[i - 3]).toBeGreaterThanOrEqual(1000 - 10);
      }
    });

    it('makes a retry wait its turn behind requests already queued', () => {
      service.getGenres().subscribe();
      tick(1);
      http.expectOne(`${BASE}/genres/anime`).flush(null, TOO_MANY_REQUESTS);

      // While the retry waits, a queue of other requests builds up.
      for (const id of [1, 2, 3]) {
        service.getAnimeById(id).subscribe();
      }

      tick(JIKAN_RETRY_BASE_DELAY_MS + JIKAN_REQUEST_INTERVAL_MS * 4);
      const sent = http.match(() => true);

      expect(sent).toHaveLength(4);
      expect(sent.map((r) => r.request.url)).toEqual([
        `${BASE}/anime/1`,
        `${BASE}/anime/2`,
        `${BASE}/anime/3`,
        `${BASE}/genres/anime`,
      ]);
      sent.forEach((r) => r.flush({ data: genres }));
    });
  });
});
