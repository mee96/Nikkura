import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { genreKey } from '../../../core/i18n/genre-key';
import { Icon } from '../../../shared/icon/icon';
import { ANIME_TYPES, AnimeType, ExploreState, MIN_SCORES, MinScore } from '../explore-query';
import { FilterGroups, FilterOption } from '../filter-options.service';

type GroupKey = keyof FilterGroups;

/** Chips shown per group before "+ N". Selected chips are always shown. */
const VISIBLE_PER_GROUP: Record<GroupKey, number> = { genres: 8, themes: 6, demographics: 5 };

/**
 * The filters: type, genres, themes, demographics and minimum score.
 * Every chip is a toggle button (`aria-pressed`) and every change is emitted
 * at once, so the URL and the results follow while the panel stays open.
 * Used as the side panel on desktop and inside the bottom sheet below it.
 */
@Component({
  selector: 'app-filter-panel',
  imports: [TranslocoPipe, Icon],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanel {
  readonly state = input.required<ExploreState>();
  /** `null` while loading. */
  readonly groups = input<FilterGroups | null>(null);
  readonly groupsFailed = input(false);
  readonly mode = input<'panel' | 'sheet'>('panel');

  readonly changed = output<Partial<ExploreState>>();
  readonly cleared = output<void>();
  readonly closed = output<void>();

  protected readonly types = ANIME_TYPES;
  protected readonly scores = MIN_SCORES;
  protected readonly groupKeys: GroupKey[] = ['genres', 'themes', 'demographics'];
  protected readonly genreKey = genreKey;

  private readonly expanded = signal<ReadonlySet<GroupKey>>(new Set());

  protected readonly selected = computed(() => new Set(this.state().genres));

  /** Options of each group, trimmed to the first few unless expanded. */
  protected readonly visible = computed(() => {
    const groups = this.groups();
    const result = {} as Record<GroupKey, { shown: FilterOption[]; hidden: number }>;
    for (const key of this.groupKeys) {
      const options = groups?.[key] ?? [];
      if (this.expanded().has(key)) {
        result[key] = { shown: options, hidden: 0 };
        continue;
      }
      const limit = VISIBLE_PER_GROUP[key];
      const shown = options.filter(
        (option, index) => index < limit || this.selected().has(option.slug),
      );
      result[key] = { shown, hidden: options.length - shown.length };
    }
    return result;
  });

  protected isExpanded(key: GroupKey): boolean {
    return this.expanded().has(key);
  }

  protected toggleGroup(key: GroupKey): void {
    this.expanded.update((current) => {
      const next = new Set(current);
      if (!next.delete(key)) {
        next.add(key);
      }
      return next;
    });
  }

  protected toggleType(type: AnimeType): void {
    this.changed.emit({ type: this.state().type === type ? null : type, page: 1 });
  }

  protected toggleGenre(slug: string): void {
    const genres = this.selected().has(slug)
      ? this.state().genres.filter((selected) => selected !== slug)
      : [...this.state().genres, slug];
    this.changed.emit({ genres, page: 1 });
  }

  protected setMinScore(minScore: MinScore | null): void {
    this.changed.emit({ minScore, page: 1 });
  }
}
