import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { Pagination, pageWindow } from './pagination';

describe('pageWindow', () => {
  it.each([
    [1, 1, [1]],
    [1, 4, [1, 2, 3, 4]],
    [1, 5, [1, 2, null, 5]],
    [2, 4, [1, 2, 3, 4]],
    [6, 12, [1, null, 5, 6, 7, null, 12]],
    [3, 12, [1, 2, 3, 4, null, 12]],
    [12, 12, [1, null, 11, 12]],
  ])('page %i of %i → %j', (current, total, expected) => {
    expect(pageWindow(current, total)).toEqual(expected);
  });
});

@Component({
  imports: [Pagination],
  template: `<app-pagination [current]="current()" [total]="total()" />`,
})
class Host {
  readonly current = signal(1);
  readonly total = signal(1);
}

describe('Pagination', () => {
  let harness: RouterTestingHarness;

  async function render(current: number, total: number): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      imports: [provideTranslocoTesting()],
      providers: [provideRouter([{ path: 'explore', component: Host }])],
    });
    harness = await RouterTestingHarness.create();
    const host = await harness.navigateByUrl('/explore?q=luna&page=' + current, Host);
    host.current.set(current);
    host.total.set(total);
    await harness.fixture.whenStable();
    return harness.routeNativeElement as HTMLElement;
  }

  it('shows nothing for a single page', async () => {
    expect((await render(1, 1)).querySelector('nav')).toBeNull();
  });

  it('marks the current page and keeps the rest of the query in the links', async () => {
    const element = await render(2, 4);
    const current = element.querySelector('[aria-current="page"]');
    const links = Array.from(element.querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Pagination');
    expect(current?.textContent?.trim()).toBe('2');
    expect(links).toContain('/explore?q=luna');
    expect(links).toContain('/explore?q=luna&page=3');
    expect(links).toContain('/explore?q=luna&page=4');
  });

  it('has no previous link on the first page and no next link on the last', async () => {
    const first = await render(1, 3);
    expect(first.querySelector('a[aria-label="Previous page"]')).toBeNull();
    expect(first.querySelector('a[aria-label="Next page"]')?.getAttribute('href')).toContain(
      'page=2',
    );
  });
});
