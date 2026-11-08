import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  take,
} from 'rxjs';

import { genreKey } from '../../core/i18n/genre-key';
import { Anime, JikanPage } from '../../core/models/jikan.model';
import { AnimeService } from '../../core/services/anime.service';
import { ViewportService } from '../../core/services/viewport.service';
import { AnimeCard } from '../../shared/anime-card/anime-card';
import { Icon } from '../../shared/icon/icon';
import { Pagination } from '../../shared/pagination/pagination';
import {
  EMPTY_STATE,
  ExploreState,
  SORT_KEYS,
  SortKey,
  countFilters,
  parseExploreParams,
  toAnimeQuery,
  toQueryParams,
} from './explore-query';
import { FilterPanel } from './filter-panel/filter-panel';
import { FilterGroups, FilterOptionsService, idsBySlug } from './filter-options.service';

type GroupsResult =
  { status: 'loading' } | { status: 'ready'; groups: FilterGroups } | { status: 'error' };

export type ResultsState =
  { status: 'loading' } | { status: 'ready'; page: JikanPage<Anime> } | { status: 'error' };

/** One removable chip above the results. */
interface ActiveFilter {
  /** Translation key, and its params (`fallback` for genres, `score` for the score). */
  label: string;
  params: Record<string, unknown>;
  remove: Partial<ExploreState>;
}

/**
 * Explore: search by title plus filters, all kept in the URL (see explore-query.ts).
 * The text comes from the search bar in the top bar, which updates `?q=` while
 * typing (debounced). Results go through AnimeService, so the content rules apply.
 */
@Component({
  selector: 'app-explore',
  imports: [TranslocoPipe, AnimeCard, FilterPanel, Icon, Pagination],
  templateUrl: './explore.html',
  styleUrl: './explore.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Explore {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly anime = inject(AnimeService);
  private readonly filterOptions = inject(FilterOptionsService);
  protected readonly viewport = inject(ViewportService);

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly sheet = viewChild<ElementRef<HTMLDialogElement>>('sheet');

  protected readonly sortKeys = SORT_KEYS;
  protected readonly skeletons = Array.from({ length: 12 }, (_, index) => index);

  private readonly state$ = this.route.queryParamMap.pipe(
    map(parseExploreParams),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  );
  protected readonly state = toSignal(this.state$, { initialValue: EMPTY_STATE });

  private readonly filtersParam = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('filters'))),
  );

  private readonly groups$: Observable<GroupsResult> = this.filterOptions.groups().pipe(
    map((groups): GroupsResult => ({ status: 'ready', groups })),
    catchError(() => of<GroupsResult>({ status: 'error' })),
    startWith<GroupsResult>({ status: 'loading' }),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
  private readonly retry$ = new BehaviorSubject<void>(undefined);

  protected readonly results = toSignal(
    combineLatest([this.state$, this.retry$]).pipe(switchMap(([state]) => this.search(state))),
    { initialValue: { status: 'loading' } as ResultsState },
  );

  // Created after `results`, so the search is queued before the filter lists.
  protected readonly groups = toSignal(this.groups$, {
    initialValue: { status: 'loading' } as GroupsResult,
  });
  protected readonly loadedGroups = computed(() => {
    const groups = this.groups();
    return groups.status === 'ready' ? groups.groups : null;
  });

  protected readonly filterCount = computed(() => countFilters(this.state()));

  protected readonly items = computed(() => {
    const results = this.results();
    return results.status === 'ready' ? results.page.data : [];
  });

  protected readonly totalPages = computed(() => {
    const results = this.results();
    return results.status === 'ready' ? results.page.pagination.last_visible_page : 0;
  });

  protected readonly total = computed(() => {
    const results = this.results();
    return results.status === 'ready' ? results.page.pagination.items.total : 0;
  });

  protected readonly activeFilters = computed<ActiveFilter[]>(() => {
    const state = this.state();
    const options = this.loadedGroups();
    const names = new Map(
      options
        ? [...options.genres, ...options.themes, ...options.demographics].map((o) => [
            o.slug,
            o.name,
          ])
        : [],
    );
    const chips: ActiveFilter[] = [];
    if (state.type) {
      chips.push({ label: `types.${state.type}`, params: {}, remove: { type: null } });
    }
    for (const slug of state.genres) {
      const name = names.get(slug) ?? slug;
      chips.push({
        label: genreKey(name),
        params: { fallback: name },
        remove: { genres: state.genres.filter((genre) => genre !== slug) },
      });
    }
    if (state.minScore) {
      chips.push({
        label: 'explore.scoreChip',
        params: { score: state.minScore },
        remove: { minScore: null },
      });
    }
    return chips;
  });

  constructor() {
    // `?filters=open` (the Filters link in the top bar) opens the sheet below desktop.
    // Reading `sheet()` makes this run again once the dialog exists on the first render.
    effect(() => {
      if (this.filtersParam() !== 'open') {
        return;
      }
      const desktop = this.viewport.isDesktop();
      if (!desktop && !this.sheet()) {
        return;
      }
      untracked(() => {
        if (!desktop) {
          this.openSheet();
        }
        void this.router.navigate([], {
          queryParams: { filters: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
    });

    // After changing page, focus the heading so keyboard and screen reader users start at the top.
    let lastPage: number | null = null;
    effect(() => {
      const page = this.state().page;
      if (lastPage !== null && page !== lastPage) {
        untracked(() => this.heading()?.nativeElement.focus());
      }
      lastPage = page;
    });
  }

  protected update(changes: Partial<ExploreState>): void {
    void this.router.navigate([], {
      queryParams: toQueryParams(changes),
      queryParamsHandling: 'merge',
    });
  }

  protected clearFilters(): void {
    this.update({ type: null, genres: [], minScore: null, page: 1 });
  }

  protected setSort(sort: string): void {
    this.update({ sort: sort as SortKey, page: 1 });
  }

  protected retry(): void {
    this.retry$.next();
  }

  protected openSheet(): void {
    const dialog = this.sheet()?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }

  protected closeSheet(): void {
    this.sheet()?.nativeElement.close();
  }

  /** Closes the sheet when the dark area around it is clicked. */
  protected onSheetClick(event: MouseEvent): void {
    if (event.target === this.sheet()?.nativeElement) {
      this.closeSheet();
    }
  }

  private search(state: ExploreState): Observable<ResultsState> {
    // Genre slugs need the ids, so wait for the list only when the URL has some.
    const ids$: Observable<ReadonlyMap<string, number> | null> =
      state.genres.length === 0
        ? of(new Map())
        : this.groups$.pipe(
            filter((groups) => groups.status !== 'loading'),
            take(1),
            map((groups) => (groups.status === 'ready' ? idsBySlug(groups.groups) : null)),
          );

    return ids$.pipe(
      switchMap((ids) =>
        ids === null
          ? of<ResultsState>({ status: 'error' })
          : this.anime.search(toAnimeQuery(state, ids)).pipe(
              map((page): ResultsState => ({ status: 'ready', page })),
              catchError(() => of<ResultsState>({ status: 'error' })),
            ),
      ),
      startWith<ResultsState>({ status: 'loading' }),
    );
  }
}
