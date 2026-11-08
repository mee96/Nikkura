import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { SEARCH_DEBOUNCE_MS, SearchBar } from './search-bar';

describe('SearchBar', () => {
  let fixture: ComponentFixture<SearchBar>;
  let element: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar, provideTranslocoTesting()],
      providers: [provideRouter([])],
    }).compileComponents();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(SearchBar);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  function submit(value: string): void {
    const input = element.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    element.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  it('is a labelled search landmark', () => {
    expect(element.querySelector('form')?.getAttribute('role')).toBe('search');
    expect(element.querySelector('label')?.textContent).toContain('Search an anime');
  });

  it('opens Explore with the trimmed text', () => {
    submit('  Frieren ');

    expect(navigate).toHaveBeenCalledWith(['/explore'], { queryParams: { q: 'Frieren' } });
  });

  it('opens Explore without a query when the box is empty', () => {
    submit('   ');

    expect(navigate).toHaveBeenCalledWith(['/explore'], { queryParams: {} });
  });

  it('links to the filters', () => {
    const filters = element.querySelector('.search__filters');

    expect(filters?.getAttribute('href')).toBe('/explore?filters=open');
    expect(filters?.textContent).toContain('Filters');
  });
});

@Component({ imports: [SearchBar], template: '<app-search-bar />' })
class Page {}

describe('SearchBar with the router', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [provideTranslocoTesting()],
      providers: [
        provideRouter([
          { path: 'explore', component: Page },
          { path: 'home', component: Page },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  const input = () => harness.routeNativeElement?.querySelector('input') as HTMLInputElement;
  const url = () => TestBed.inject(Router).url;
  const type = (value: string) => {
    input().value = value;
    input().dispatchEvent(new Event('input'));
  };
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  it('on Explore, searches while typing after a short pause, back to page 1', async () => {
    await harness.navigateByUrl('/explore?type=tv&page=3', Page);

    type('fri');
    await wait(SEARCH_DEBOUNCE_MS / 2);
    type('frieren');
    await wait(SEARCH_DEBOUNCE_MS / 2);
    expect(url()).toBe('/explore?type=tv&page=3');

    await wait(SEARCH_DEBOUNCE_MS);
    await harness.fixture.whenStable();
    expect(url()).toBe('/explore?type=tv&q=frieren');
  });

  it('shows the text of the URL on Explore, also after going back', async () => {
    await harness.navigateByUrl('/explore?q=luna', Page);
    expect(input().value).toBe('luna');

    await harness.navigateByUrl('/explore?q=sol', Page);
    await harness.fixture.whenStable();
    expect(input().value).toBe('sol');
  });

  it('elsewhere, waits for Enter and then opens Explore', async () => {
    await harness.navigateByUrl('/home', Page);

    type('frieren');
    await wait(SEARCH_DEBOUNCE_MS * 1.5);
    expect(url()).toBe('/home');

    harness.routeNativeElement
      ?.querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable();
    expect(url()).toBe('/explore?q=frieren');
  });

  it('clears the text and the search with the clear button', async () => {
    await harness.navigateByUrl('/explore?q=luna&genres=romance', Page);
    await harness.fixture.whenStable();
    const clear = harness.routeNativeElement?.querySelector<HTMLButtonElement>('.search__clear');

    expect(clear?.getAttribute('aria-label')).toBe('Clear the search');
    clear?.click();
    await harness.fixture.whenStable();

    expect(input().value).toBe('');
    expect(url()).toBe('/explore?genres=romance');
  });

  it('on Explore, the filters link keeps the current search', async () => {
    await harness.navigateByUrl('/explore?q=luna', Page);
    await harness.fixture.whenStable();

    expect(
      harness.routeNativeElement?.querySelector('.search__filters')?.getAttribute('href'),
    ).toBe('/explore?q=luna&filters=open');
  });
});
