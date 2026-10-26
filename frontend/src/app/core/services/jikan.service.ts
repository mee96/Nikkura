import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  defer,
  map,
  retry,
  shareReplay,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Anime,
  AnimeSearchParams,
  Genre,
  JikanItem,
  JikanList,
  JikanPage,
  SeasonParams,
} from '../models/jikan.model';

/**
 * Jikan allows 3 requests per second and 60 per minute. We space requests
 * 350 ms apart (about 2.9 per second), which also keeps us under 60 per minute
 * for any normal browsing.
 */
export const JIKAN_REQUEST_INTERVAL_MS = 350;

/** Retries after a 429, waiting 1 s, 2 s and 4 s. */
export const JIKAN_MAX_RETRIES = 3;
export const JIKAN_RETRY_BASE_DELAY_MS = 1000;

/** Genres and the current season change rarely, so one hour is plenty. */
export const JIKAN_CACHE_TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
  expiresAt: number;
  response$: Observable<unknown>;
}

/**
 * The only place that talks to Jikan (https://docs.api.jikan.moe).
 * Screens don't use it directly: they go through AnimeService, which adds the content rules.
 *
 * - Requests go through a queue that spaces them out.
 * - A 429 is retried with exponential backoff; any other error is passed on.
 * - Genres and the current season are cached in memory, and equal requests
 *   made at the same time share a single call.
 */
@Injectable({ providedIn: 'root' })
export class JikanService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.jikanUrl;
  private readonly cache = new Map<string, CacheEntry>();

  /** Earliest moment (ms) at which the next request may leave. */
  private nextSlot = 0;

  searchAnime(params: AnimeSearchParams = {}): Observable<JikanPage<Anime>> {
    return this.get<JikanPage<Anime>>('/anime', params);
  }

  getAnimeById(id: number): Observable<Anime> {
    return this.get<JikanItem<Anime>>(`/anime/${id}`).pipe(map((response) => response.data));
  }

  getGenres(): Observable<Genre[]> {
    return this.getCached<JikanList<Genre>>('/genres/anime').pipe(map((response) => response.data));
  }

  getCurrentSeason(page = 1, params: SeasonParams = {}): Observable<JikanPage<Anime>> {
    return this.getCached<JikanPage<Anime>>('/seasons/now', { ...params, page });
  }

  private get<T>(path: string, params: object = {}): Observable<T> {
    const query = toQuery(params);

    return defer(() => this.waitForSlot()).pipe(
      switchMap(() => this.http.get<T>(`${this.baseUrl}${path}`, { params: query })),
      retry({
        count: JIKAN_MAX_RETRIES,
        delay: (error: unknown, retryCount: number) =>
          isRateLimited(error)
            ? timer(JIKAN_RETRY_BASE_DELAY_MS * 2 ** (retryCount - 1))
            : throwError(() => error),
      }),
    );
  }

  private getCached<T>(path: string, params: object = {}): Observable<T> {
    const query = toQuery(params);
    const key = `${path}?${new URLSearchParams(query).toString()}`;

    const hit = this.cache.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.response$ as Observable<T>;
    }

    const entry: CacheEntry = {
      expiresAt: Date.now() + JIKAN_CACHE_TTL_MS,
      response$: this.get<T>(path, params).pipe(
        // A failed call must not stay cached, or the error would last an hour.
        tap({
          error: () => {
            if (this.cache.get(key) === entry) {
              this.cache.delete(key);
            }
          },
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      ),
    };
    this.cache.set(key, entry);
    return entry.response$ as Observable<T>;
  }

  /**
   * Reserves the next free slot in the queue and emits when it arrives.
   * Retries call this again, so they wait their turn too.
   */
  private waitForSlot(): Observable<number> {
    const now = Date.now();
    const slot = Math.max(now, this.nextSlot);
    this.nextSlot = slot + JIKAN_REQUEST_INTERVAL_MS;
    return timer(slot - now);
  }
}

function isRateLimited(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 429;
}

/**
 * Turns a params object into a query for Jikan: arrays are joined with commas
 * and empty values are skipped. Keys are sorted so equal queries always give
 * the same cache key. New params (e.g. `sfw`, `genres_exclude`) need no change here.
 */
function toQuery(params: object): Record<string, string> {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(params) as [string, unknown][]) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length > 0) {
        query[key] = value.join(',');
      }
    } else {
      query[key] = String(value);
    }
  }

  return Object.fromEntries(Object.entries(query).sort(([a], [b]) => a.localeCompare(b)));
}
