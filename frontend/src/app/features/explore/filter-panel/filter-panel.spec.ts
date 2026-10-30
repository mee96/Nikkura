import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslocoTesting } from '../../../../testing/transloco';
import { LanguageService } from '../../../core/services/language.service';
import { EMPTY_STATE, ExploreState } from '../explore-query';
import { FilterGroups, FilterOption } from '../filter-options.service';
import { FilterPanel } from './filter-panel';

const option = (id: number, name: string, mature = false): FilterOption => ({
  id,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  mature,
});

const GROUPS: FilterGroups = {
  genres: [
    'Action',
    'Comedy',
    'Drama',
    'Fantasy',
    'Romance',
    'Sci-Fi',
    'Slice of Life',
    'Sports',
    'Mystery',
    'Horror',
  ].map((name, index) => option(index + 1, name)),
  themes: [option(23, 'School')],
  demographics: [option(25, 'Shoujo')],
};
GROUPS.genres.push(option(9, 'Ecchi', true));

describe('FilterPanel', () => {
  let fixture: ComponentFixture<FilterPanel>;
  let element: HTMLElement;
  let changes: Partial<ExploreState>[];

  async function render(state: Partial<ExploreState> = {}, inputs: Record<string, unknown> = {}) {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [FilterPanel, provideTranslocoTesting()] });
    TestBed.inject(LanguageService).setLang('en');
    fixture = TestBed.createComponent(FilterPanel);
    fixture.componentRef.setInput('state', { ...EMPTY_STATE, ...state });
    fixture.componentRef.setInput('groups', GROUPS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    changes = [];
    fixture.componentInstance.changed.subscribe((change) => changes.push(change));
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  afterEach(() => localStorage.clear());

  const chip = (label: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.chip')).find(
      (button) => button.textContent?.replace(/\s+/g, ' ').trim() === label,
    );

  it('groups the chips in labelled fieldsets', async () => {
    await render();
    const legends = Array.from(element.querySelectorAll('legend')).map((l) =>
      l.textContent?.trim(),
    );

    expect(legends).toEqual(['Type', 'Genres', 'Themes', 'Demographics', 'Minimum score']);
  });

  it('selects a type and unselects it on a second press, back to page 1', async () => {
    await render({ type: 'tv', page: 3 });

    expect(chip('TV')?.getAttribute('aria-pressed')).toBe('true');
    chip('TV')?.click();
    chip('Movie')?.click();

    expect(changes).toEqual([
      { type: null, page: 1 },
      { type: 'movie', page: 1 },
    ]);
  });

  it('adds and removes genres', async () => {
    await render({ genres: ['romance'] });

    chip('Romance')?.click();
    chip('Drama')?.click();

    expect(changes).toEqual([
      { genres: [], page: 1 },
      { genres: ['romance', 'drama'], page: 1 },
    ]);
  });

  it('shows the first genres and the rest behind "+ N", but always the selected ones', async () => {
    await render({ genres: ['horror'] });
    const more = element.querySelector<HTMLButtonElement>('.chip--more');

    expect(chip('Mystery')).toBeUndefined();
    expect(chip('Horror')?.getAttribute('aria-pressed')).toBe('true');
    expect(more?.getAttribute('aria-label')).toBe('Show 2 more');

    more?.click();
    await fixture.whenStable();

    expect(chip('Mystery')).toBeDefined();
    expect(chip('Show less')).toBeDefined();
  });

  it('marks ecchi as +18', async () => {
    await render({ genres: ['ecchi'] });

    expect(chip('Ecchi +18')).toBeDefined();
  });

  it('sets and clears the minimum score', async () => {
    await render({ minScore: 7 });

    expect(chip('Any')?.getAttribute('aria-pressed')).toBe('false');
    expect(chip('7+')?.getAttribute('aria-label')).toBe('Score 7+');
    chip('8+')?.click();
    chip('Any')?.click();

    expect(changes).toEqual([
      { minScore: 8, page: 1 },
      { minScore: null, page: 1 },
    ]);
  });

  it('says when the genres could not be loaded, and keeps the other filters', async () => {
    await render({}, { groups: null, groupsFailed: true });

    expect(element.textContent).toContain("Couldn't load the genres.");
    expect(element.querySelectorAll('legend')).toHaveLength(2);
  });

  it('as a panel, clears everything from the header', async () => {
    await render();
    let cleared = 0;
    fixture.componentInstance.cleared.subscribe(() => cleared++);

    Array.from(element.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Clear all')
      ?.click();

    expect(cleared).toBe(1);
    expect(element.querySelector('.filters__footer')).toBeNull();
  });

  it('as a sheet, has a labelled close button and a footer', async () => {
    await render({}, { mode: 'sheet' });
    let closed = 0;
    fixture.componentInstance.closed.subscribe(() => closed++);

    element.querySelector<HTMLButtonElement>('.filters__close')?.click();
    Array.from(element.querySelectorAll('.filters__footer button'))
      .find((b) => b.textContent?.trim() === 'Show results')
      ?.dispatchEvent(new Event('click'));

    expect(element.querySelector('.filters__close')?.getAttribute('aria-label')).toBe(
      'Close the filters',
    );
    expect(closed).toBe(2);
  });

  it('tells everyone what is never shown', async () => {
    await render();

    expect(element.querySelector('.filters__note')?.textContent).toContain(
      'hentai and erotica are never shown',
    );
  });
});
