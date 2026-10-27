import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { Icon } from '../icon/icon';

/** Search by title plus a link to the filters. Searching opens Explore with `?q=`. */
@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, Icon],
  template: `
    <form class="search" role="search" (submit)="search($event)">
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
      <a class="search__filters" routerLink="/explore" [queryParams]="{ filters: 'open' }">
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

  protected search(event: Event): void {
    event.preventDefault();
    const q = this.query.value.trim();
    void this.router.navigate(['/explore'], { queryParams: q ? { q } : {} });
  }
}
