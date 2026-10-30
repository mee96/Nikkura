import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { Genre, GenreFilter } from '../../core/models/jikan.model';
import { JikanService } from '../../core/services/jikan.service';
import { FilterOptionsService, idsBySlug } from './filter-options.service';

const g = (mal_id: number, name: string, count: number): Genre => ({ mal_id, name, count });

const LISTS: Record<GenreFilter, Genre[]> = {
  genres: [g(22, 'Romance', 50), g(1, 'Action', 900), g(36, 'Slice of Life', 300)],
  explicit_genres: [g(12, 'Hentai', 999), g(49, 'Erotica', 10), g(9, 'Ecchi', 400)],
  themes: [g(66, 'Mahou Shoujo', 30), g(23, 'School', 500)],
  demographics: [g(25, 'Shoujo', 100), g(27, 'Shounen', 800)],
};

describe('FilterOptionsService', () => {
  let getGenres: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getGenres = vi.fn((filter: GenreFilter) => of(LISTS[filter]));
    TestBed.configureTestingModule({
      providers: [{ provide: JikanService, useValue: { getGenres } }],
    });
  });

  it('asks Jikan for each group', async () => {
    await firstValueFrom(TestBed.inject(FilterOptionsService).groups());

    expect(getGenres.mock.calls.map(([filter]) => filter).sort()).toEqual([
      'demographics',
      'explicit_genres',
      'genres',
      'themes',
    ]);
  });

  it('sorts each group by popularity and builds slugs', async () => {
    const groups = await firstValueFrom(TestBed.inject(FilterOptionsService).groups());

    expect(groups.themes.map((o) => o.slug)).toEqual(['school', 'mahou-shoujo']);
    expect(groups.demographics.map((o) => o.name)).toEqual(['Shounen', 'Shoujo']);
  });

  it('never offers hentai or erotica, and adds ecchi to the genres with the +18 mark', async () => {
    const groups = await firstValueFrom(TestBed.inject(FilterOptionsService).groups());
    const genres = groups.genres.map((o) => o.name);

    expect(genres).toEqual(['Action', 'Ecchi', 'Slice of Life', 'Romance']);
    expect(groups.genres.find((o) => o.name === 'Ecchi')?.mature).toBe(true);
    expect(groups.genres.find((o) => o.name === 'Action')?.mature).toBe(false);
  });

  it('maps every slug to its id', async () => {
    const groups = await firstValueFrom(TestBed.inject(FilterOptionsService).groups());
    const ids = idsBySlug(groups);

    expect(ids.get('slice-of-life')).toBe(36);
    expect(ids.get('mahou-shoujo')).toBe(66);
    expect(ids.get('shoujo')).toBe(25);
    expect(ids.has('hentai')).toBe(false);
  });
});
