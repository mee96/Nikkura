import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ContentParams, EXCLUDED_GENRES } from '../content/content-rules';
import { GenreService } from './genre.service';

/** Builds the content params for every Jikan list request. */
@Injectable({ providedIn: 'root' })
export class ContentRulesService {
  private readonly genres = inject(GenreService);

  /**
   * `sfw=true` plus the excluded genres, resolved by name. If the genre list
   * can't be loaded, `sfw` still applies and the results are filtered anyway.
   */
  params(): Observable<ContentParams> {
    return this.genres
      .idsOf(EXCLUDED_GENRES)
      .pipe(map((ids) => ({ sfw: true, genres_exclude: ids })));
  }
}
