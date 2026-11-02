import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { isExcludedGenreName, isMatureGenreName } from '../../core/content/content-rules';
import { genreSlug } from '../../core/i18n/genre-key';
import { Genre } from '../../core/models/jikan.model';
import { JikanService } from '../../core/services/jikan.service';

export interface FilterOption {
  /** Used in the URL and as translation key (`genres.<slug>`). */
  slug: string;
  /** Jikan name, in English: the fallback when a name is missing from our table. */
  name: string;
  id: number;
  /** Shown with the +18 mark. */
  mature: boolean;
}

export interface FilterGroups {
  genres: FilterOption[];
  themes: FilterOption[];
  demographics: FilterOption[];
}

/**
 * The genre, theme and demographic chips of the filters, built from Jikan
 * (each group is one cached request). Hentai and erotica are left out; ecchi,
 * which Jikan lists apart as explicit, joins the genres with its +18 mark.
 * Each group is sorted by how many anime it has, so the most useful come first.
 */
@Injectable({ providedIn: 'root' })
export class FilterOptionsService {
  private readonly jikan = inject(JikanService);

  groups(): Observable<FilterGroups> {
    return forkJoin({
      genres: this.jikan.getGenres('genres'),
      explicit: this.jikan.getGenres('explicit_genres'),
      themes: this.jikan.getGenres('themes'),
      demographics: this.jikan.getGenres('demographics'),
    }).pipe(
      map(({ genres, explicit, themes, demographics }) => ({
        genres: toOptions([...genres, ...explicit]),
        themes: toOptions(themes),
        demographics: toOptions(demographics),
      })),
    );
  }
}

function toOptions(list: Genre[]): FilterOption[] {
  return list
    .filter((genre) => !isExcludedGenreName(genre.name))
    .sort((a, b) => b.count - a.count)
    .map((genre) => ({
      slug: genreSlug(genre.name),
      name: genre.name,
      id: genre.mal_id,
      mature: isMatureGenreName(genre.name),
    }));
}

/** Slug → Jikan id for every option, to build the search query from the URL. */
export function idsBySlug(groups: FilterGroups): Map<string, number> {
  return new Map(
    [...groups.genres, ...groups.themes, ...groups.demographics].map((option) => [
      option.slug,
      option.id,
    ]),
  );
}
