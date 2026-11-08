import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { makeAnime } from '../../../testing/anime';
import { provideTranslocoTesting } from '../../../testing/transloco';
import { Anime, JikanPage } from '../../core/models/jikan.model';
import { AnimeService } from '../../core/services/anime.service';
import { LanguageService } from '../../core/services/language.service';
import { ViewportService } from '../../core/services/viewport.service';
import { Explore } from './explore';
import { FilterGroups, FilterOptionsService } from './filter-options.service';

const GROUPS: FilterGroups = {
  genres: [
    { id: 22, name: 'Romance', slug: 'romance', mature: false },
    { id: 10, name: 'Fantasy', slug: 'fantasy', mature: false },
  ],
  themes: [{ id: 66, name: 'Mahou Shoujo', slug: 'mahou-shoujo', mature: false }],
  demographics: [{ id: 25, name: 'Shoujo', slug: 'shoujo', mature: false }],
};

function page(data: Anime[], total = data.length, lastPage = 1): JikanPage<Anime> {
  return {
    data,
    pagination: {
      current_page: 1,
      last_visible_page: lastPage,
      has_next_page: lastPage > 1,
      items: { count: data.length, total, per_page: 24 },
    },
  };
}

describe('Explore', () => {
  let harness: RouterTestingHarness;
  let search: ReturnType<typeof vi.fn<(query: unknown) => Observable<JikanPage<Anime>>>>;
  let groups: () => Observable<FilterGroups>;
  const desktop = signal(true);

  async function open(url: string): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      imports: [provideTranslocoTesting()],
      providers: [
        provideRouter([{ path: 'explore', component: Explore }]),
        { provide: AnimeService, useValue: { search } },
        { provide: FilterOptionsService, useValue: { groups: () => groups() } },
        { provide: ViewportService, useValue: { isDesktop: desktop } },
      ],
    });
    TestBed.inject(LanguageService).setLang('en');
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Explore);
    await harness.fixture.whenStable();
    return harness.routeNativeElement as HTMLElement;
  }

  const element = () => harness.routeNativeElement as HTMLElement;
  const text = (selector: string) =>
    element().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
  const url = () => TestBed.inject(Router).url;
  const settle = async () => {
    TestBed.tick();
    await harness.fixture.whenStable();
  };

  beforeEach(() => {
    localStorage.clear();
    desktop.set(true);
    search = vi.fn(() => of(page([makeAnime({ mal_id: 1, title: 'Frieren' })], 38, 2)));
    groups = () => of(GROUPS);
  });

  afterEach(() => localStorage.clear());

  describe('results', () => {
    it('shows the count, the text and the cards', async () => {
      await open('/explore?q=frieren');

      expect(text('h1')).toBe('38 results for “frieren”');
      expect(element().querySelectorAll('app-anime-card')).toHaveLength(1);
      expect(element().querySelector('app-pagination nav')).not.toBeNull();
    });

    it('says "1 result" in the singular', async () => {
      search.mockReturnValue(of(page([makeAnime()], 1)));
      await open('/explore');

      expect(text('h1')).toBe('1 result');
    });

    it('searches with the URL state and the genre ids', async () => {
      await open('/explore?q=luna&type=tv&genres=romance,shoujo&min_score=7&sort=score&page=2');

      expect(search).toHaveBeenCalledWith({
        q: 'luna',
        type: 'tv',
        genres: [22, 25],
        min_score: 7,
        order_by: 'score',
        sort: 'desc',
        page: 2,
        limit: 24,
      });
    });

    it('searches at once when there are no genres, without waiting for the genre list', async () => {
      const pending = new Subject<FilterGroups>();
      groups = () => pending;
      await open('/explore?q=luna');

      expect(search).toHaveBeenCalledOnce();
    });

    it('waits for the genre list when the URL has genres', async () => {
      const pending = new Subject<FilterGroups>();
      groups = () => pending;
      await open('/explore?genres=romance');

      expect(search).not.toHaveBeenCalled();
      expect(element().querySelector('.grid[aria-busy="true"]')).not.toBeNull();

      pending.next(GROUPS);
      pending.complete();
      await settle();

      expect(search).toHaveBeenCalledWith(expect.objectContaining({ genres: [22] }));
    });
  });

  describe('states', () => {
    it('shows skeletons while loading', async () => {
      search.mockReturnValue(new Subject<JikanPage<Anime>>());
      await open('/explore');

      expect(element().querySelector('.grid')?.getAttribute('aria-busy')).toBe('true');
      expect(element().querySelectorAll('.skeleton')).toHaveLength(12);
      expect(text('h1')).toBe('Explore');
    });

    it('shows an error with a retry button', async () => {
      search.mockReturnValue(throwError(() => new Error('500')));
      await open('/explore');

      expect(element().querySelector('[role="alert"]')).not.toBeNull();
      expect(text('.message__title')).toBe("Couldn't load the results");

      search.mockReturnValue(of(page([makeAnime()], 1)));
      element().querySelector<HTMLButtonElement>('.message__button')?.click();
      await settle();

      expect(search).toHaveBeenCalledTimes(2);
      expect(text('h1')).toBe('1 result');
    });

    it('shows an error when the URL has genres but the genre list fails', async () => {
      groups = () => throwError(() => new Error('500'));
      await open('/explore?genres=romance');

      expect(search).not.toHaveBeenCalled();
      expect(text('.message__title')).toBe("Couldn't load the results");
    });

    it('shows the empty state and lets you clear the filters', async () => {
      search.mockReturnValue(of(page([], 0)));
      await open('/explore?q=zzz&type=tv&min_score=8');

      expect(text('.message__title')).toBe('No results');
      element().querySelector<HTMLButtonElement>('.message__button')?.click();
      await settle();

      expect(url()).toBe('/explore?q=zzz');
    });
  });

  describe('filters in the URL', () => {
    it('updates the URL when a chip is pressed, back to page 1', async () => {
      await open('/explore?q=luna&page=3');

      Array.from(element().querySelectorAll<HTMLButtonElement>('app-filter-panel .chip'))
        .find((chip) => chip.textContent?.trim() === 'Romance')
        ?.click();
      await settle();

      expect(url()).toBe('/explore?q=luna&genres=romance');
      expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ genres: [22], page: 1 }));
    });

    it('lists the active filters and removes one', async () => {
      await open('/explore?type=tv&genres=romance,fantasy&min_score=7');
      const chips = Array.from(element().querySelectorAll<HTMLButtonElement>('.active__chip'));

      expect(chips.map((chip) => chip.textContent?.trim())).toEqual([
        'TV',
        'Romance',
        'Fantasy',
        'Score 7+',
      ]);
      expect(chips[1].getAttribute('aria-label')).toBe('Remove filter: Romance');

      chips[1].click();
      await settle();

      expect(url()).toBe('/explore?type=tv&genres=fantasy&min_score=7');
    });

    it('changes the sort', async () => {
      await open('/explore?q=luna');
      const select = element().querySelector<HTMLSelectElement>('.sort__select');

      select!.value = 'newest';
      select!.dispatchEvent(new Event('change'));
      await settle();

      expect(url()).toBe('/explore?q=luna&sort=newest');
    });

    it('focuses the heading after changing page', async () => {
      await open('/explore?q=luna');

      await TestBed.inject(Router).navigateByUrl('/explore?q=luna&page=2');
      await settle();

      expect(document.activeElement?.id).toBe('results-title');
    });
  });

  describe('below desktop', () => {
    beforeEach(() => {
      desktop.set(false);
      HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      };
      HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      };
    });

    it('puts the filters in a sheet opened from a button with the count', async () => {
      await open('/explore?type=tv&genres=romance');
      const button = element().querySelector<HTMLButtonElement>('.active__open');

      expect(element().querySelector('aside app-filter-panel')).toBeNull();
      expect(button?.textContent?.trim()).toBe('Filters · 2');
      expect(button?.getAttribute('aria-haspopup')).toBe('dialog');

      button?.click();

      expect(element().querySelector('dialog.sheet')?.hasAttribute('open')).toBe(true);
    });

    it('opens the sheet from ?filters=open and removes the param', async () => {
      await open('/explore?q=luna&filters=open');
      await settle();

      expect(element().querySelector('dialog.sheet')?.hasAttribute('open')).toBe(true);
      expect(url()).toBe('/explore?q=luna');
    });
  });
});
