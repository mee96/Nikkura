import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Pages to show: the first, the last and the ones around the current page,
 * with `null` where pages are skipped. `pageWindow(6, 12)` → 1 … 5 6 7 … 12.
 */
export function pageWindow(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: (number | null)[] = [];
  for (const page of sorted) {
    const previous = result.at(-1);
    if (typeof previous === 'number' && page - previous > 1) {
      result.push(page - previous === 2 ? previous + 1 : null);
    }
    result.push(page);
  }
  return result;
}

/** Page links that keep the rest of the query (filters, search) and change only `page`. */
@Component({
  selector: 'app-pagination',
  imports: [RouterLink, TranslocoPipe],
  template: `
    @if (total() > 1) {
      <nav class="pagination" [attr.aria-label]="'pagination.label' | transloco">
        <ul class="pagination__list">
          <li>
            @if (current() > 1) {
              <a
                class="pagination__link"
                [routerLink]="[]"
                [queryParams]="{ page: pageParam(current() - 1) }"
                queryParamsHandling="merge"
                [attr.aria-label]="'pagination.previous' | transloco"
                >‹</a
              >
            }
          </li>
          @for (page of pages(); track $index) {
            <li>
              @if (page === null) {
                <span class="pagination__gap" aria-hidden="true">…</span>
              } @else if (page === current()) {
                <span
                  class="pagination__link pagination__link--current"
                  aria-current="page"
                  [attr.aria-label]="'pagination.page' | transloco: { page }"
                  >{{ page }}</span
                >
              } @else {
                <a
                  class="pagination__link"
                  [routerLink]="[]"
                  [queryParams]="{ page: pageParam(page) }"
                  queryParamsHandling="merge"
                  [attr.aria-label]="'pagination.page' | transloco: { page }"
                  >{{ page }}</a
                >
              }
            </li>
          }
          <li>
            @if (current() < total()) {
              <a
                class="pagination__link"
                [routerLink]="[]"
                [queryParams]="{ page: current() + 1 }"
                queryParamsHandling="merge"
                [attr.aria-label]="'pagination.next' | transloco"
                >›</a
              >
            }
          </li>
        </ul>
      </nav>
    }
  `,
  styles: `
    .pagination__list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .pagination__link,
    .pagination__gap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--touch-target);
      min-height: var(--touch-target);
      padding: 0 var(--space-2);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-weight: var(--font-weight-bold);
      text-decoration: none;
    }

    a.pagination__link {
      border: var(--border-width) solid var(--color-border);
      background: var(--color-surface);

      &:hover {
        border-color: var(--color-border-strong);
      }
    }

    .pagination__link--current {
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly current = input.required<number>();
  readonly total = input.required<number>();

  protected readonly pages = computed(() => pageWindow(this.current(), this.total()));

  /** Page 1 is the default, so it is removed from the URL. */
  protected pageParam(page: number): number | null {
    return page > 1 ? page : null;
  }
}
