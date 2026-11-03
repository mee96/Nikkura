import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { isMatureAnime } from '../../core/content/content-rules';
import { genreKey, genreSlug } from '../../core/i18n/genre-key';
import { Anime } from '../../core/models/jikan.model';
import { LanguageService } from '../../core/services/language.service';

/**
 * Cover, score, +18 mark, title and "type · year · demographic". Links to the anime page.
 * Each role dresses it differently through tokens (see anime-card.scss), e.g. a VHS spine.
 */
@Component({
  selector: 'app-anime-card',
  imports: [RouterLink, TranslocoPipe],
  template: `
    <a class="card" [routerLink]="['/anime', anime().mal_id]">
      <span class="card__cover">
        @if (cover(); as src) {
          <img class="card__image" [src]="src" alt="" loading="lazy" decoding="async" />
        }
        @if (score(); as value) {
          <span class="card__badge card__badge--score">
            <span aria-hidden="true">★</span>
            <span class="visually-hidden">{{ 'anime.scoreLabel' | transloco }}</span>
            {{ value }}
          </span>
        }
        @if (mature()) {
          <span
            class="card__badge card__badge--mature"
            [attr.title]="'content.matureNote' | transloco"
          >
            <span aria-hidden="true">{{ 'content.mature' | transloco }}</span>
            <span class="visually-hidden">{{ 'content.matureLabel' | transloco }}</span>
          </span>
        }
      </span>
      <span class="card__title">{{ anime().title }}</span>
      @if (statSegments(); as segments) {
        <span class="card__stat" aria-hidden="true">
          @for (on of segments; track $index) {
            <span
              class="card__stat-segment"
              [class.card__stat-segment--on]="on"
              [style.--i]="$index"
            ></span>
          }
        </span>
      }
      <span class="card__meta">
        @if (typeKey(); as key) {
          <span>{{ key | transloco: { fallback: anime().type } }}</span>
        }
        @if (anime().year; as year) {
          <span>{{ year }}</span>
        }
        @if (demographic(); as name) {
          <span>{{ genreKey(name) | transloco: { fallback: name } }}</span>
        }
      </span>
    </a>
  `,
  styleUrl: './anime-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimeCard {
  private readonly language = inject(LanguageService);

  readonly anime = input.required<Anime>();

  protected readonly genreKey = genreKey;

  protected readonly cover = computed(() => {
    const { webp, jpg } = this.anime().images;
    return webp.large_image_url ?? jpg.large_image_url ?? webp.image_url ?? jpg.image_url;
  });

  /** "8,7" in Catalan and Spanish, "8.7" in English. */
  protected readonly score = computed(() => {
    const score = this.anime().score;
    if (score === null || score === undefined) {
      return null;
    }
    return new Intl.NumberFormat(this.language.lang(), {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(score);
  });

  /** The score as ten segments, filled up to the rounded score. `null` without a score. */
  protected readonly statSegments = computed(() => {
    const score = this.anime().score;
    if (score === null || score === undefined) {
      return null;
    }
    return Array.from({ length: 10 }, (_, index) => index < Math.round(score));
  });

  protected readonly mature = computed(() => isMatureAnime(this.anime()));

  /** Jikan types ("TV", "Movie", "TV Special") → `types.tv`, `types.movie`, `types.tv-special`. */
  protected readonly typeKey = computed(() => {
    const type = this.anime().type;
    return type ? `types.${genreSlug(type)}` : null;
  });

  protected readonly demographic = computed(() => this.anime().demographics?.[0]?.name ?? null);
}
