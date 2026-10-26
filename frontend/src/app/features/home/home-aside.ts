import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ThemeService } from '../../core/services/theme.service';

/**
 * Side column of the home on wide screens.
 * Visitors get the invitation to pick a role. Users will see their Kura folders
 * here (M3, a stand-in for now), and the season trends (#13) join both.
 */
@Component({
  selector: 'app-home-aside',
  imports: [RouterLink, TranslocoPipe],
  template: `
    @if (isGuest()) {
      <section class="card" aria-labelledby="invite-title">
        <h2 id="invite-title" class="card__title">{{ 'home.inviteTitle' | transloco }}</h2>
        <p class="card__text">{{ 'home.inviteText' | transloco }}</p>
        <ul class="roles" [attr.aria-label]="'home.inviteRoles' | transloco">
          @for (role of roles; track role) {
            <li class="roles__item">
              <!-- data-role scopes that role's tokens to the dot, so it shows the role's own colours -->
              <span class="roles__dot" [attr.data-role]="role" aria-hidden="true"></span>
              {{ 'roles.' + role | transloco }}
            </li>
          }
        </ul>
        <a class="card__button" routerLink="/signup">{{ 'home.inviteButton' | transloco }}</a>
      </section>
    } @else {
      <section class="card" aria-labelledby="folders-title">
        <h2 id="folders-title" class="card__title">{{ 'nav.kura' | transloco }}</h2>
        <p class="card__text">{{ 'pages.comingSoonText' | transloco }}</p>
      </section>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding: var(--space-6);
      border: var(--border-width) solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    .card__title {
      font-size: var(--text-xl);
    }

    .card__text {
      margin: 0;
      color: var(--color-muted);
      font-size: var(--text-sm);
    }

    .roles {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .roles__item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--text-sm);
      font-weight: var(--font-weight-bold);
    }

    .roles__dot {
      width: var(--space-7);
      height: var(--space-7);
      border: 3px solid var(--color-border-strong);
      border-radius: var(--radius-pill);
      background: var(--color-primary);
    }

    /* Senpai is a dark theme: its dot is the black background with an orange ring. */
    .roles__dot[data-role='senpai'] {
      border-color: var(--color-primary);
      background: var(--color-bg);
    }

    .card__button {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: var(--touch-target);
      border-radius: var(--radius-sm);
      background: var(--color-primary);
      color: var(--color-on-primary);
      font-weight: var(--font-weight-bold);
      text-decoration: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAside {
  private readonly theme = inject(ThemeService);
  protected readonly isGuest = computed(() => this.theme.role() === 'guest');
  protected readonly roles = ['moe', 'haku', 'senpai'] as const;
}
