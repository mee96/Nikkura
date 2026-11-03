import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  forkJoin,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { genreKey } from '../../core/i18n/genre-key';
import { Anime } from '../../core/models/jikan.model';
import { AnimeService } from '../../core/services/anime.service';
import { GenreService } from '../../core/services/genre.service';
import { Role, ThemeService } from '../../core/services/theme.service';
import { AnimeCard } from '../../shared/anime-card/anime-card';
import { Icon } from '../../shared/icon/icon';
import { HeroMotif } from './hero-motif/hero-motif';
import { ROLE_GENRES } from './role-genres';

export type HomeState =
  | { status: 'loading' }
  | { status: 'ready'; featured: Anime; shelf: Anime[] }
  | { status: 'empty' }
  | { status: 'error' };

/** Anime asked for each genre of the role, and how many make the shelf. */
const PER_GENRE = 8;
const SHELF_SIZE = 6;
const MIN_SCORE = 7;

/**
 * Home: a featured anime and a shelf of recommendations. Roles get the best rated
 * anime of their genres (Jikan has no "any of these genres", so there is one
 * request per genre, merged); visitors get the current season. Everything goes
 * through AnimeService, so the content rules apply.
 *
 * Each role dresses the same structure differently through tokens, plus the
 * hero motif and the way saving reacts (see variables.css section 5c).
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslocoPipe, AnimeCard, HeroMotif, Icon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly theme = inject(ThemeService);
  private readonly anime = inject(AnimeService);
  private readonly genres = inject(GenreService);

  protected readonly role = this.theme.role;
  protected readonly isGuest = computed(() => this.role() === 'guest');
  protected readonly genreNames = computed(() => {
    const role = this.role();
    return role === 'guest' ? [] : ROLE_GENRES[role];
  });

  private readonly retry$ = new BehaviorSubject<void>(undefined);

  protected readonly state = toSignal(
    combineLatest([toObservable(this.role), this.retry$]).pipe(
      switchMap(([role]) => this.load(role)),
    ),
    { initialValue: { status: 'loading' } as HomeState },
  );

  protected readonly featured = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state.featured : null;
  });

  protected readonly shelf = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state.shelf : [];
  });

  /** Titles of the shelf, for the nodes of the Senpai banner. */
  protected readonly relatedTitles = computed(() => this.shelf().map((anime) => anime.title));

  protected readonly skeletons = Array.from({ length: SHELF_SIZE - 1 }, (_, index) => index);
  protected readonly genreKey = genreKey;

  // Stand-in until the Kura exists (M3): saving is only remembered while the page is open.
  protected readonly saved = signal(false);
  /** True after the first save, so the reaction (sparkles, pulse) doesn't play on load. */
  protected readonly reacted = signal(false);

  protected toggleSaved(): void {
    this.saved.update((saved) => !saved);
    this.reacted.set(true);
  }

  protected retry(): void {
    this.retry$.next();
  }

  private load(role: Role): Observable<HomeState> {
    const items$ =
      role === 'guest'
        ? this.anime.currentSeason().pipe(map((page) => page.data))
        : this.byGenres(ROLE_GENRES[role]);

    return items$.pipe(
      map((items): HomeState => {
        const [featured, ...shelf] = items.slice(0, SHELF_SIZE + 1);
        return featured ? { status: 'ready', featured, shelf } : { status: 'empty' };
      }),
      catchError(() => of<HomeState>({ status: 'error' })),
      startWith<HomeState>({ status: 'loading' }),
    );
  }

  /** Best rated anime of any of the genres, without repeats. */
  private byGenres(names: readonly string[]): Observable<Anime[]> {
    return this.genres.idsOf(names).pipe(
      switchMap((ids) =>
        ids.length === 0
          ? of([] as Anime[][])
          : forkJoin(
              ids.map((id) =>
                this.anime
                  .search({
                    genres: [id],
                    min_score: MIN_SCORE,
                    order_by: 'score',
                    sort: 'desc',
                    limit: PER_GENRE,
                  })
                  .pipe(map((page) => page.data)),
              ),
            ),
      ),
      map((lists) => {
        const unique = new Map(lists.flat().map((anime) => [anime.mal_id, anime]));
        return [...unique.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      }),
    );
  }
}
