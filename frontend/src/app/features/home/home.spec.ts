import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { makeAnime, tag } from '../../../testing/anime';
import { provideTranslocoTesting } from '../../../testing/transloco';
import { Anime, JikanPage } from '../../core/models/jikan.model';
import { AnimeService } from '../../core/services/anime.service';
import { GenreService } from '../../core/services/genre.service';
import { LanguageService } from '../../core/services/language.service';
import { Role, ThemeService } from '../../core/services/theme.service';
import { Home } from './home';

function page(data: Anime[]): JikanPage<Anime> {
  return {
    data,
    pagination: {
      current_page: 1,
      last_visible_page: 1,
      has_next_page: false,
      items: { count: data.length, total: data.length, per_page: 8 },
    },
  };
}

const anime = (mal_id: number, score: number, title = `Anime ${mal_id}`) =>
  makeAnime({ mal_id, score, title, synopsis: `About ${title}` });

describe('Home', () => {
  let search: ReturnType<
    typeof vi.fn<(query: { genres?: number[] }) => Observable<JikanPage<Anime>>>
  >;
  let currentSeason: ReturnType<typeof vi.fn<() => Observable<JikanPage<Anime>>>>;
  let idsOf: ReturnType<typeof vi.fn<(names: readonly string[]) => Observable<number[]>>>;

  async function render(role: Role = 'guest') {
    TestBed.inject(LanguageService).setLang('en');
    TestBed.inject(ThemeService).setRole(role);
    const fixture = TestBed.createComponent(Home);
    TestBed.tick();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      TestBed.tick();
      await fixture.whenStable();
    };
    const text = (selector: string) =>
      element.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
    return { fixture, element, settle, text };
  }

  beforeEach(() => {
    localStorage.clear();
    search = vi.fn((query) =>
      of(
        page(
          query.genres?.[0] === 1
            ? [anime(10, 8.1), anime(11, 7.4)]
            : [anime(10, 8.1), anime(12, 9.2)],
        ),
      ),
    );
    currentSeason = vi.fn(() => of(page([1, 2, 3, 4, 5, 6, 7].map((id) => anime(id, 8)))));
    idsOf = vi.fn(() => of([1, 2]));
    TestBed.configureTestingModule({
      imports: [provideTranslocoTesting()],
      providers: [
        provideRouter([]),
        { provide: AnimeService, useValue: { search, currentSeason } },
        { provide: GenreService, useValue: { idsOf } },
      ],
    });
  });

  afterEach(() => localStorage.clear());

  it('gives the page a heading and the banner its own', async () => {
    const { element, text } = await render();

    expect(text('h1')).toBe('Home');
    expect(element.querySelector('h2#hero-title')).not.toBeNull();
  });

  describe('the +18 mark on the banner', () => {
    it('shows it when the featured anime is ecchi', async () => {
      currentSeason.mockReturnValue(
        of(page([makeAnime({ mal_id: 1, title: 'Ecchi', explicit_genres: [tag('Ecchi', 9)] })])),
      );
      const { element } = await render('guest');
      const badge = element.querySelector('.hero__badge');

      expect(badge?.textContent).toContain('+18');
      expect(badge?.getAttribute('title')).toBeTruthy();
    });

    it('does not show it for other anime', async () => {
      const { element } = await render('guest');

      expect(element.querySelector('.hero__title')).not.toBeNull();
      expect(element.querySelector('.hero__badge')).toBeNull();
    });
  });

  describe('visitors', () => {
    it('show the current season: a featured anime and five covers on the shelf', async () => {
      const { element, text } = await render('guest');

      expect(search).not.toHaveBeenCalled();
      expect(text('.hero__title')).toBe('Anime 1');
      expect(text('.hero__eyebrow')).toBe('Top of the season');
      expect(text('.shelf__title')).toBe('This season');
      expect(element.querySelector('.shelf__genres')).toBeNull();
      // six on the shelf: the sixth only fills the rows of smaller screens
      expect(element.querySelectorAll('app-anime-card').length).toBe(6);
    });

    it('are asked to log in to save', async () => {
      const { element } = await render('guest');
      const link = element.querySelector('.hero__ghost');

      expect(link?.tagName).toBe('A');
      expect(link?.getAttribute('href')).toBe('/login');
    });
  });

  describe('roles', () => {
    it('ask one search per genre of the role and merge them best rated first, without repeats', async () => {
      const { element, text } = await render('moe');

      expect(idsOf).toHaveBeenCalledWith(['Shoujo', 'Mahou Shoujo', 'Romance']);
      expect(search).toHaveBeenCalledTimes(2);
      expect(search).toHaveBeenCalledWith(expect.objectContaining({ genres: [1], min_score: 7 }));
      expect(text('.hero__title')).toBe('Anime 12');
      const shelf = [...element.querySelectorAll('.card__title')].map((el) => el.textContent);
      expect(shelf).toEqual(['Anime 10', 'Anime 11']);
    });

    it('show the genres of the role translated', async () => {
      const { element } = await render('haku');

      expect(
        [...element.querySelectorAll('.shelf__genre')].map((el) => el.textContent?.trim()),
      ).toEqual(['Shoujo', 'Isekai']);
    });

    it('translate the shelf title and the genres', async () => {
      TestBed.inject(LanguageService).setLang('ca');
      const { element } = await render('senpai');
      TestBed.inject(LanguageService).setLang('ca');
      TestBed.tick();

      expect(element.querySelector('.shelf__title')?.textContent?.trim()).toBe(
        'Recomanats per al teu rol',
      );
    });

    it('load again when the role changes', async () => {
      const { text, settle } = await render('moe');
      expect(search).toHaveBeenCalledTimes(2);

      TestBed.inject(ThemeService).setRole('senpai');
      await settle();

      expect(idsOf).toHaveBeenLastCalledWith(['Seinen', 'Slice of Life']);
      expect(text('.shelf__title')).toBe('Recommended for your role');
    });

    it('show nothing to recommend when no genre id is found', async () => {
      idsOf.mockReturnValue(of([]));
      const { element, text } = await render('moe');

      expect(search).not.toHaveBeenCalled();
      expect(text('.notice__title')).toBe('Nothing to recommend yet');
      expect(element.querySelector('.hero')).toBeNull();
    });
  });

  describe('saving', () => {
    it('changes the button and sparkles once for Moe Magical', async () => {
      const { element, settle, text } = await render('moe');
      expect(element.querySelector('.sparkles')).toBeNull();

      (element.querySelector('.hero__ghost') as HTMLButtonElement).click();
      await settle();

      expect(text('.hero__ghost')).toBe('Saved');
      expect(element.querySelector('.hero__ghost')?.classList).toContain('hero__ghost--on');
      expect(element.querySelectorAll('.sparkles__star').length).toBe(4);
    });

    it('pulses the button instead for the other roles, and toggles back', async () => {
      const { element, settle, text } = await render('haku');
      const button = element.querySelector('.hero__ghost') as HTMLButtonElement;

      button.click();
      await settle();
      expect(button.classList).toContain('hero__ghost--pulse');
      expect(element.querySelector('.sparkles')).toBeNull();

      button.click();
      await settle();
      expect(text('.hero__ghost')).toBe('Save');
    });
  });

  describe('when Jikan fails', () => {
    it('explains it and tries again on request', async () => {
      currentSeason.mockReturnValueOnce(throwError(() => new Error('429')));
      const { element, settle, text } = await render('guest');

      expect(text('.notice__title')).toBe("Couldn't load the recommendations");

      (element.querySelector('.notice__button') as HTMLButtonElement).click();
      await settle();

      expect(currentSeason).toHaveBeenCalledTimes(2);
      expect(element.querySelector('.hero')).not.toBeNull();
    });
  });
});
