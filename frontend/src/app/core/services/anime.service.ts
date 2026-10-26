import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';

import { BlockedContentError, isAllowedAnime } from '../content/content-rules';
import { Anime, AnimeSearchParams, JikanPage } from '../models/jikan.model';
import { ContentRulesService } from './content-rules.service';
import { JikanService } from './jikan.service';

/** Content-related params are set here, never by the caller. */
export type AnimeQuery = Omit<AnimeSearchParams, 'sfw' | 'genres_exclude'>;

/**
 * What screens use to get anime. It applies the content rules to every call,
 * so no screen can forget them:
 * - list requests carry `sfw` and the excluded genres (#8),
 * - every result is filtered again on our side,
 * - an anime that is not allowed fails with `BlockedContentError`.
 *
 * Filtered results can leave a page with fewer items than the pagination says.
 */
@Injectable({ providedIn: 'root' })
export class AnimeService {
  private readonly jikan = inject(JikanService);
  private readonly contentRules = inject(ContentRulesService);

  search(query: AnimeQuery = {}): Observable<JikanPage<Anime>> {
    return this.contentRules.params().pipe(
      switchMap((rules) => this.jikan.searchAnime({ ...query, ...rules })),
      map(onlyAllowed),
    );
  }

  /** `/seasons/now` accepts `sfw` but not `genres_exclude`, so the filter does the rest. */
  currentSeason(page = 1): Observable<JikanPage<Anime>> {
    return this.jikan.getCurrentSeason(page, { sfw: true }).pipe(map(onlyAllowed));
  }

  byId(id: number): Observable<Anime> {
    return this.jikan.getAnimeById(id).pipe(
      map((anime) => {
        if (!isAllowedAnime(anime)) {
          throw new BlockedContentError(id);
        }
        return anime;
      }),
    );
  }
}

function onlyAllowed(page: JikanPage<Anime>): JikanPage<Anime> {
  return { ...page, data: page.data.filter(isAllowedAnime) };
}
