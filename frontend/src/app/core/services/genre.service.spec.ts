import { TestBed } from '@angular/core/testing';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';

import { Genre } from '../models/jikan.model';
import { GenreService, normalizeGenreName } from './genre.service';
import { JikanService } from './jikan.service';

const GENRES: Genre[] = [
  { mal_id: 101, name: 'Slice of Life', count: 1 },
  { mal_id: 202, name: 'Shoujo', count: 1 },
  { mal_id: 303, name: 'Mahou Shoujo', count: 1 },
  { mal_id: 404, name: 'Hentai', count: 1 },
];

describe('GenreService', () => {
  let getGenres: ReturnType<typeof vi.fn<() => Observable<Genre[]>>>;
  let service: GenreService;

  beforeEach(() => {
    getGenres = vi.fn(() => of(GENRES));
    TestBed.configureTestingModule({
      providers: [{ provide: JikanService, useValue: { getGenres } }],
    });
    service = TestBed.inject(GenreService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('finds the id of a name, ignoring case and spaces', async () => {
    expect(await firstValueFrom(service.idOf('Shoujo'))).toBe(202);
    expect(await firstValueFrom(service.idOf('  slice   of LIFE '))).toBe(101);
  });

  it('keeps the order and drops repeats', async () => {
    const ids = await firstValueFrom(service.idsOf(['Mahou Shoujo', 'Shoujo', 'shoujo']));

    expect(ids).toEqual([303, 202]);
  });

  it('logs unknown names and still returns the known ones', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const ids = await firstValueFrom(service.idsOf(['Shoujo', 'Space Opera', 'Isekai']));

    expect(ids).toEqual([202]);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('Space Opera, Isekai');
  });

  it('returns undefined for one unknown name', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(await firstValueFrom(service.idOf('Nope'))).toBeUndefined();
  });

  it('does not break when the list cannot be loaded', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    getGenres.mockReturnValue(throwError(() => new Error('offline')));

    expect(await firstValueFrom(service.idsOf(['Shoujo']))).toEqual([]);
    expect(error).toHaveBeenCalledOnce();
    expect(warn).not.toHaveBeenCalled();
  });

  it('asks Jikan again after a failure, so a later lookup can work', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getGenres.mockReturnValueOnce(throwError(() => new Error('offline')));

    expect(await firstValueFrom(service.idsOf(['Shoujo']))).toEqual([]);
    expect(await firstValueFrom(service.idsOf(['Shoujo']))).toEqual([202]);
  });

  it('lists every genre', async () => {
    expect((await firstValueFrom(service.all())).map((genre) => genre.name)).toEqual(
      GENRES.map((genre) => genre.name),
    );
  });
});

describe('normalizeGenreName', () => {
  it('lowercases and collapses spaces', () => {
    expect(normalizeGenreName('  Award   Winning ')).toBe('award winning');
  });
});
