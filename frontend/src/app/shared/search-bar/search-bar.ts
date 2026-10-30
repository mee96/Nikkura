import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs';

import { Icon } from '../icon/icon';

/** Wait after the last key before searching, so Jikan isn't asked on every letter. */
export const SEARCH_DEBOUNCE_MS = 350;

const EXPLORE_PATH = '/explore';

/**
 * Search by title plus a link to the filters, in the top bar of every screen.
 *
 * - On Explore it searches while typing (debounced) by updating `?q=`, and
 *   shows the text of the current URL.
 * - Anywhere else, Enter opens Explore with the text.
 */
@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, Icon],
  template: `
    <form class="search" role="search" (submit)="submit($event)">
      <label class="search__field">
        <app-icon class="search__icon" name="search" />
        <span class="visually-hidden">{{ 'search.label' | transloco }}</span>
        <input
          class="search__input"
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          [formControl]="query"
          [placeholder]="'search.placeholder' | transloco"
        />
      </label>
      @if (text()) {
        <button
          type="button"
          class="search__clear"
          [attr.aria-label]="'search.clear' | transloco"
          (click)="clear()"
        >
          <app-icon name="close" />
        </button>
      }
      <a
        class="search__filters"
        routerLink="/explore"
        [queryParams]="{ filters: 'open' }"
        [queryParamsHandling]="onExplore() ? 'merge' : ''"
      >
        <app-icon name="filters" />
        <span class="search__filters-label">{{ 'search.filters' | transloco }}</span>
      </a>
    </form>
  `,
  styleUrl: './search-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBar {
  private readonly router = inject(Router);
  protected readonly query = new FormControl('', { nonNullable: true });

  /** The text in the box, to show the clear button. */
  protected readonly text = signal('');

  /** The current URL, updated after every navigation. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly onExplore = () => isExploreUrl(this.url());

  constructor() {
    // Show the text of the URL on Explore (also after back/forward).
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.onExplore()) {
          const q = this.urlQuery();
          if (q !== this.query.value.trim()) {
            this.query.setValue(q, { emitEvent: false });
            this.text.set(q);
          }
        }
      });

    this.query.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.text.set(value));

    // Search while typing, only on Explore.
    this.query.valueChanges
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        map((value) => value.trim()),
        distinctUntilChanged(),
        filter((q) => this.onExplore() && q !== this.urlQuery()),
        takeUntilDestroyed(),
      )
      .subscribe((q) => this.go(q, true));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.go(this.query.value.trim(), false);
  }

  protected clear(): void {
    this.query.setValue('');
    if (this.onExplore()) {
      this.go('', true);
    }
  }

  /** Typing replaces the history entry, so Back doesn't walk through every letter. */
  private go(q: string, replaceUrl: boolean): void {
    if (this.onExplore()) {
      void this.router.navigate([EXPLORE_PATH], {
        queryParams: { q: q || null, page: null },
        queryParamsHandling: 'merge',
        replaceUrl,
      });
    } else {
      void this.router.navigate([EXPLORE_PATH], { queryParams: q ? { q } : {} });
    }
  }

  private urlQuery(): string {
    return (this.router.parseUrl(this.router.url).queryParamMap.get('q') ?? '').trim();
  }
}

function isExploreUrl(url: string): boolean {
  const path = url.split(/[?#]/)[0];
  return path === EXPLORE_PATH || path.startsWith(`${EXPLORE_PATH}/`);
}
