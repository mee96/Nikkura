import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { SearchBar } from './search-bar';

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
