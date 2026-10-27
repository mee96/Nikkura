import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';

import { Genre } from '../models/jikan.model';
import { ContentRulesService } from './content-rules.service';
import { JikanService } from './jikan.service';

const GENRES: Genre[] = [
  { mal_id: 9, name: 'Ecchi', count: 1 },
  { mal_id: 12, name: 'Hentai', count: 1 },
  { mal_id: 22, name: 'Romance', count: 1 },
  { mal_id: 49, name: 'Erotica', count: 1 },
];

describe('ContentRulesService', () => {
  let getGenres: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getGenres = vi.fn(() => of(GENRES));
    TestBed.configureTestingModule({
      providers: [{ provide: JikanService, useValue: { getGenres } }],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('asks for sfw and excludes hentai and erotica, resolved by name', async () => {
    const params = await firstValueFrom(TestBed.inject(ContentRulesService).params());

    expect(params).toEqual({ sfw: true, genres_exclude: [12, 49] });
  });

  it('does not exclude ecchi, which is shown with a +18 mark', async () => {
    const params = await firstValueFrom(TestBed.inject(ContentRulesService).params());

    expect(params.genres_exclude).not.toContain(9);
  });

  it('keeps sfw when the genre list cannot be loaded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getGenres.mockReturnValue(throwError(() => new Error('offline')));

    const params = await firstValueFrom(TestBed.inject(ContentRulesService).params());

    expect(params).toEqual({ sfw: true, genres_exclude: [] });
  });
});
