import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import {
  BlockedContentError,
  isMatureAnime,
  isMatureGenreName,
} from '../../core/content/content-rules';
import { formatScore } from '../../core/i18n/format-score';
import { genreKey, genreSlug } from '../../core/i18n/genre-key';
import { Anime, AnimeTag } from '../../core/models/jikan.model';
import { AnimeService } from '../../core/services/anime.service';
import { LanguageService } from '../../core/services/language.service';

export type DetailState =
  | { status: 'loading' }
  | { status: 'ready'; anime: Anime }
  | { status: 'blocked' }
  | { status: 'notFound' }
  | { status: 'error' };

/** One genre, theme or demographic chip, linking to Explore filtered by it. */
interface Chip {
  name: string;
  slug: string;
}

const STATUS_KEYS: Record<string, string> = {
  'finished airing': 'finished',
  'currently airing': 'airing',
  'not yet aired': 'upcoming',
};

const SEASONS = ['winter', 'spring', 'summer', 'fall'];

/** The id in the URL must be a whole number. Anything else is "not found" without asking Jikan. */
export function parseAnimeId(value: string): number | null {
  const id = /^\d+$/.test(value) ? Number(value) : NaN;
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * The anime page (`/anime/:id`): cover, title, scores, facts, genres, synopsis
 * and trailer, plus reserved space for the actions that come with accounts
 * (save to Kura, score, comments). Data goes through AnimeService, so an
 * anime the content rules block shows a "not available" page.
 */
@Component({
  selector: 'app-anime-detail',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './anime-detail.html',
  styleUrl: './anime-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimeDetail {
  private readonly animeService = inject(AnimeService);
  private readonly language = inject(LanguageService);

  /** The `:id` of the route (bound by `withComponentInputBinding`). */
  readonly id = input.required<string>();

  protected readonly genreKey = genreKey;
  private readonly retry$ = new BehaviorSubject<void>(undefined);

  protected readonly state = toSignal(
    combineLatest([toObservable(this.id), this.retry$]).pipe(switchMap(([id]) => this.load(id))),
    { initialValue: { status: 'loading' } as DetailState },
  );

  protected readonly anime = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state.anime : null;
  });

  /** "8,6" in Catalan and Spanish, "8.6" in English. */
  protected readonly score = computed(() => formatScore(this.anime()?.score, this.language.lang()));

  protected readonly votes = computed(() => {
    const votes = this.anime()?.scored_by;
    return votes ? new Intl.NumberFormat(this.language.lang()).format(votes) : null;
  });

  protected readonly cover = computed(() => {
    const images = this.anime()?.images;
    return (
      images?.webp.large_image_url ??
      images?.jpg.large_image_url ??
      images?.webp.image_url ??
      images?.jpg.image_url ??
      null
    );
  });

  protected readonly mature = computed(() => {
    const anime = this.anime();
    return anime ? isMatureAnime(anime) : false;
  });

  /** The English or Japanese title, when it adds something to the main one. */
  protected readonly altTitle = computed(() => {
    const anime = this.anime();
    const other = anime?.title_english ?? anime?.title_japanese ?? null;
    return other && other !== anime?.title ? other : null;
  });

  protected readonly typeKey = computed(() => {
    const type = this.anime()?.type;
    return type ? `types.${genreSlug(type)}` : null;
  });

  protected readonly statusKey = computed(() => {
    const status = this.anime()?.status;
    const key = status ? STATUS_KEYS[status.trim().toLowerCase()] : null;
    return key ? `anime.status.${key}` : null;
  });

  protected readonly season = computed(() => {
    const anime = this.anime();
    const season = anime?.season?.toLowerCase() ?? '';
    return anime?.year && SEASONS.includes(season)
      ? { key: `anime.seasons.${season}`, year: anime.year }
      : null;
  });

  protected readonly studios = computed(() => this.names(this.anime()?.studios));

  /** Genres, then themes and demographics, without repeats. Ecchi and Erotica are the only explicit ones shown. */
  protected readonly chips = computed<Chip[]>(() => {
    const anime = this.anime();
    if (!anime) {
      return [];
    }
    const tags = [
      ...anime.genres,
      ...(anime.explicit_genres ?? []).filter((tag) => isMatureGenreName(tag.name)),
      ...anime.themes,
      ...anime.demographics,
    ];
    const seen = new Set<string>();
    return tags
      .map((tag) => ({ name: tag.name, slug: genreSlug(tag.name) }))
      .filter((chip) => !seen.has(chip.slug) && seen.add(chip.slug));
  });

  /** Built from the YouTube id, never from a URL Jikan sends. */
  protected readonly trailerUrl = computed(() => {
    const id = this.anime()?.trailer?.youtube_id;
    return id && /^[\w-]{6,20}$/.test(id)
      ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
      : null;
  });

  protected retry(): void {
    this.retry$.next();
  }

  private names(tags: AnimeTag[] | undefined): string[] {
    return (tags ?? []).map((tag) => tag.name);
  }

  private load(id: string): Observable<DetailState> {
    const animeId = parseAnimeId(id);
    if (animeId === null) {
      return of<DetailState>({ status: 'notFound' });
    }
    return this.animeService.byId(animeId).pipe(
      map((anime): DetailState => ({ status: 'ready', anime })),
      catchError((error: unknown) => of<DetailState>(toErrorState(error))),
      startWith<DetailState>({ status: 'loading' }),
    );
  }
}

function toErrorState(error: unknown): DetailState {
  if (error instanceof BlockedContentError) {
    return { status: 'blocked' };
  }
  if (error instanceof HttpErrorResponse && error.status === 404) {
    return { status: 'notFound' };
  }
  return { status: 'error' };
}
