import { Injectable, inject } from '@angular/core';
import { Observable, catchError, defer, map, of } from 'rxjs';

import { Genre, GenreFilter } from '../models/jikan.model';
import { JikanService } from './jikan.service';

/** Genre names are compared without case or extra spaces: "slice of life" finds "Slice of Life". */
export function normalizeGenreName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Turns Jikan genre, theme and demographic names into their ids.
 *
 * Ids can change on MyAnimeList, so the code always works with names and asks
 * this service for the ids. The list comes from `/genres/anime`, which
 * JikanService loads once and caches. A missing name is logged and skipped,
 * and if the list cannot be loaded every lookup returns nothing instead of failing.
 */
@Injectable({ providedIn: 'root' })
export class GenreService {
  private readonly jikan = inject(JikanService);

  /** Normalised name → genre, for every genre or for one group. */
  private index(filter?: GenreFilter): Observable<ReadonlyMap<string, Genre>> {
    return defer(() => this.jikan.getGenres(filter)).pipe(
      map((genres) => new Map(genres.map((genre) => [normalizeGenreName(genre.name), genre]))),
      catchError((error: unknown) => {
        console.error('[GenreService] Could not load the Jikan genres', error);
        return of(new Map<string, Genre>());
      }),
    );
  }

  /** Every genre, theme and demographic Jikan knows. */
  all(): Observable<Genre[]> {
    return this.index().pipe(map((index) => [...index.values()]));
  }

  /** Id of one name, or `undefined` (and a warning) when Jikan has no such name. */
  idOf(name: string): Observable<number | undefined> {
    return this.idsOf([name]).pipe(map((ids) => ids[0]));
  }

  /**
   * Ids of several names, in the same order, without repeats.
   * Unknown names are logged together and left out. Pass `filter` to look in
   * one group only, which reuses a request other screens already made.
   */
  idsOf(names: readonly string[], filter?: GenreFilter): Observable<number[]> {
    return this.index(filter).pipe(
      map((index) => {
        const ids: number[] = [];
        const missing: string[] = [];

        for (const name of names) {
          const genre = index.get(normalizeGenreName(name));
          if (!genre) {
            missing.push(name);
          } else if (!ids.includes(genre.mal_id)) {
            ids.push(genre.mal_id);
          }
        }

        // An empty index means the list failed to load, which is already logged.
        if (missing.length > 0 && index.size > 0) {
          console.warn(`[GenreService] Unknown genre names: ${missing.join(', ')}`);
        }
        return ids;
      }),
    );
  }
}
