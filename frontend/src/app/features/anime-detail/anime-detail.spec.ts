import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { makeAnime, tag } from '../../../testing/anime';
import { provideTranslocoTesting } from '../../../testing/transloco';
import { BlockedContentError } from '../../core/content/content-rules';
import { Anime } from '../../core/models/jikan.model';
import { AnimeService } from '../../core/services/anime.service';
import { LanguageService } from '../../core/services/language.service';
import { AnimeDetail, parseAnimeId } from './anime-detail';

describe('parseAnimeId', () => {
  it('accepts whole positive numbers', () => {
    expect(parseAnimeId('5114')).toBe(5114);
  });

  it.each(['', '0', '-3', '1.5', 'abc', '12abc', '99999999999999999999'])('rejects %j', (value) => {
    expect(parseAnimeId(value)).toBeNull();
  });
});

describe('AnimeDetail', () => {
  let harness: RouterTestingHarness;
  let byId: ReturnType<typeof vi.fn<(id: number) => Observable<Anime>>>;

  async function open(url: string, lang = 'en'): Promise<void> {
    TestBed.configureTestingModule({
      imports: [provideTranslocoTesting()],
      providers: [
        provideRouter([{ path: 'anime/:id', component: AnimeDetail }], withComponentInputBinding()),
        { provide: AnimeService, useValue: { byId } },
      ],
    });
    TestBed.inject(LanguageService).setLang(lang as 'en');
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, AnimeDetail);
    await harness.fixture.whenStable();
  }

  const element = () => harness.routeNativeElement as HTMLElement;
  const text = (selector: string) =>
    element().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
  const settle = async () => {
    TestBed.tick();
    await harness.fixture.whenStable();
  };

  const full = (overrides: Partial<Anime> = {}) =>
    makeAnime({
      mal_id: 7,
      title: 'Tsuki no Yakusoku',
      title_english: 'Promise to the Moon',
      score: 8.41,
      scored_by: 1248,
      episodes: 12,
      season: 'fall',
      year: 2026,
      synopsis: 'A young witch shares a secret.',
      themes: [tag('Mahou Shoujo', 66)],
      studios: [tag('Hoshizora', 1), tag('Komorebi', 2)],
      trailer: { youtube_id: 'abc123XYZ_-', url: 'https://example.com/ignored' },
      ...overrides,
    });

  beforeEach(() => {
    localStorage.clear();
    byId = vi.fn(() => of(full()));
  });

  it('asks for the anime of the URL', async () => {
    await open('/anime/7');
    expect(byId).toHaveBeenCalledWith(7);
  });

  it('shows title, other title, facts, genres and synopsis', async () => {
    await open('/anime/7');

    expect(text('h1')).toBe('Tsuki no Yakusoku');
    expect(text('.anime__alt')).toBe('Promise to the Moon');
    expect(text('.fact--score')).toContain('★ 8.41');
    expect(text('.fact--score')).toContain('1,248 votes');
    expect(text('.facts')).toContain('12 episodes');
    expect(text('.facts')).toContain('Finished');
    expect(text('.facts')).toContain('Fall 2026');
    expect(text('.facts')).toContain('Hoshizora, Komorebi');
    expect(text('.facts')).toContain('TV');
    expect(text('.chips')).toContain('Romance');
    expect(text('.chips')).toContain('Mahou Shoujo');
    expect(text('.synopsis__text')).toBe('A young witch shares a secret.');
  });

  it('formats numbers for the language', async () => {
    await open('/anime/7', 'ca');
    expect(text('.fact--score')).toContain('8,41');
    expect(text('.fact--score')).toContain(
      '1248 vots'.replace('1248', new Intl.NumberFormat('ca').format(1248)),
    );
    expect(text('.facts')).toContain('12 episodis');
    expect(text('.facts')).toContain('Tardor 2026');
  });

  it('links each genre to Explore filtered by it', async () => {
    await open('/anime/7');
    const links = [...element().querySelectorAll<HTMLAnchorElement>('.chip')].map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toContain('/explore?genres=mahou-shoujo');
    expect(links).toContain('/explore?genres=romance');
  });

  it('shows no alternative title when it repeats the main one', async () => {
    byId.mockReturnValue(of(full({ title: 'Same', title_english: 'Same' })));
    await open('/anime/7');
    expect(element().querySelector('.anime__alt')).toBeNull();
  });

  it('builds the trailer link from the YouTube id and opens it safely', async () => {
    await open('/anime/7');
    const link = element().querySelector<HTMLAnchorElement>('a.button[target="_blank"]');
    expect(link?.getAttribute('href')).toBe('https://www.youtube.com/watch?v=abc123XYZ_-');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it.each([
    ['an unsafe id', { youtube_id: 'x"><script>', url: null }],
    ['no id', { youtube_id: null, url: 'https://example.com' }],
    ['no trailer', null],
  ])('shows no trailer button for %s', async (_name, trailer) => {
    byId.mockReturnValue(of(full({ trailer })));
    await open('/anime/7');
    expect(element().querySelector('a[target="_blank"]')).toBeNull();
  });

  it('copes with a missing score, synopsis, studios and episode count', async () => {
    byId.mockReturnValue(
      of(
        full({
          score: null,
          scored_by: null,
          synopsis: null,
          studios: undefined,
          episodes: null,
          season: null,
          year: null,
        }),
      ),
    );
    await open('/anime/7');

    expect(text('.fact--score')).toContain('No score yet');
    expect(text('.synopsis__text')).toBe('There is no synopsis yet.');
    expect(text('.facts')).toContain('Episodes unknown');
    expect(text('.facts')).not.toContain('Studios');
    expect(text('.facts')).not.toContain('Season');
  });

  it('shows the +18 mark and its explanation for ecchi', async () => {
    byId.mockReturnValue(of(full({ explicit_genres: [tag('Ecchi', 9)] })));
    await open('/anime/7');

    expect(text('.mark')).toContain('+18');
    expect(text('.anime__note')).toContain('ecchi');
    expect(text('.chips')).toContain('Ecchi');
  });

  it('shows the +18 mark for erotica, with a chip that links to Explore', async () => {
    byId.mockReturnValue(of(full({ explicit_genres: [tag('Erotica', 49)] })));
    await open('/anime/7');
    const links = [...element().querySelectorAll<HTMLAnchorElement>('.chip')].map((a) =>
      a.getAttribute('href'),
    );

    expect(text('.mark')).toContain('+18');
    expect(text('.anime__note')).toContain('erotica');
    expect(links).toContain('/explore?genres=erotica');
  });

  it('never shows a Hentai chip', async () => {
    byId.mockReturnValue(of(full({ explicit_genres: [tag('Ecchi', 9), tag('Hentai', 12)] })));
    await open('/anime/7');

    expect(text('.chips')).toContain('Ecchi');
    expect(text('.chips')).not.toContain('Hentai');
  });

  it('shows no +18 mark for everyday anime', async () => {
    await open('/anime/7');
    expect(element().querySelector('.mark')).toBeNull();
    expect(element().querySelector('.anime__note')).toBeNull();
  });

  it('keeps room for save, score and comments', async () => {
    await open('/anime/7');
    expect(element().querySelectorAll('.slot')).toHaveLength(3);
    expect(text('.slots')).toContain('Save to your Kura');
    expect(text('.slots')).toContain('Your score');
    expect(text('.slots')).toContain('Comments');
  });

  describe('states', () => {
    it('shows a loading state until the anime arrives', async () => {
      const response = new Subject<Anime>();
      byId.mockReturnValue(response);
      await open('/anime/7');

      expect(element().querySelector('[role="status"]')).not.toBeNull();
      expect(element().querySelector('h1')).toBeNull();

      response.next(full());
      await settle();

      expect(element().querySelector('[role="status"]')).toBeNull();
      expect(text('h1')).toBe('Tsuki no Yakusoku');
    });

    it('shows a "not available" page for blocked content', async () => {
      byId.mockReturnValue(throwError(() => new BlockedContentError(7)));
      await open('/anime/7');

      expect(text('h1')).toBe('Not available on Nikkura');
      expect(element().querySelector('.facts')).toBeNull();
      expect(element().querySelector('.anime__title')).toBeNull();
    });

    it('shows "not found" for a 404', async () => {
      byId.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      await open('/anime/7');
      expect(text('h1')).toBe('Anime not found');
    });

    it('shows "not found" for a broken id without asking Jikan', async () => {
      await open('/anime/abc');
      expect(text('h1')).toBe('Anime not found');
      expect(byId).not.toHaveBeenCalled();
    });

    it('shows an error with a retry that asks again', async () => {
      byId.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 500 })));
      await open('/anime/7');

      expect(element().querySelector('[role="alert"]')).not.toBeNull();
      expect(text('h1')).toBe("Couldn't load this anime");

      element().querySelector<HTMLButtonElement>('button.button')?.click();
      await settle();

      expect(byId).toHaveBeenCalledTimes(2);
      expect(text('h1')).toBe('Tsuki no Yakusoku');
    });

    it('loads the new anime when the id in the URL changes', async () => {
      await open('/anime/7');
      byId.mockReturnValue(of(full({ mal_id: 8, title: 'Another one' })));

      await harness.navigateByUrl('/anime/8', AnimeDetail);
      await settle();

      expect(byId).toHaveBeenLastCalledWith(8);
      expect(text('h1')).toBe('Another one');
    });
  });
});
