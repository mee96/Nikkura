import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ContentParams, EXCLUDED_GENRES } from '../content/content-rules';
import { GenreService } from './genre.service';

/** Builds the content params for every Jikan list request. */
@Injectable({ providedIn: 'root' })
export class ContentRulesService {
  private readonly genres = inject(GenreService);

  /**
   * The excluded genres (hentai), resolved by name in Jikan's explicit group
   * (the same request the filters use). If the genre list can't be loaded the
   * list is empty and the results are still filtered on our side.
   */
  params(): Observable<ContentParams> {
    return this.genres
      .idsOf(EXCLUDED_GENRES, 'explicit_genres')
      .pipe(map((ids) => ({ genres_exclude: ids })));
  }
}
