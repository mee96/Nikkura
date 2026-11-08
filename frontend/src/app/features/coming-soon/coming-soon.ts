import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/** Stand-in for a screen that is not built yet. The title comes from the route data. */
@Component({
  selector: 'app-coming-soon',
  imports: [TranslocoPipe],
  template: `
    <section class="coming-soon" aria-labelledby="page-title">
      <p class="coming-soon__badge">{{ 'pages.comingSoon' | transloco }}</p>
      <h1 id="page-title" class="coming-soon__title">{{ titleKey() | transloco }}</h1>
      <p class="coming-soon__text">{{ 'pages.comingSoonText' | transloco }}</p>
    </section>
  `,
  styles: `
    .coming-soon {
      padding: var(--space-8);
      border: var(--border-width) dashed var(--color-border-strong);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    .coming-soon__badge {
      display: inline-block;
      margin: 0 0 var(--space-3);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-pill);
      background: var(--color-soft);
      color: var(--color-primary-text);
      font-size: var(--text-sm);
      font-weight: var(--font-weight-bold);
    }

    .coming-soon__title {
      font-size: var(--text-2xl);
    }

    .coming-soon__text {
      margin: var(--space-3) 0 0;
      color: var(--color-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoon {
  /** Translation key of the page title, from the route `data`. */
  readonly titleKey = input.required<string>();
}
