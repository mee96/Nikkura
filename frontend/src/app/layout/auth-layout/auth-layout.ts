import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { Icon } from '../../shared/icon/icon';
import { LanguageSwitch } from '../../shared/language-switch/language-switch';

/**
 * Frame for login and sign-up: no app navigation, only the brand, the language
 * switch and a way back to exploring. It always uses the visitor look, because
 * the person has no role yet, so `data-role="guest"` is set on this element.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, TranslocoPipe, Icon, LanguageSwitch],
  host: { 'data-role': 'guest' },
  template: `
    <header class="auth-header">
      <a class="auth-header__brand" routerLink="/">Nikkura</a>
      <div class="auth-header__actions">
        <a class="auth-header__back" routerLink="/explore">
          <app-icon name="arrowLeft" />
          {{ 'shell.backToExplore' | transloco }}
        </a>
        <app-language-switch />
      </div>
    </header>
    <main id="main" class="auth-main">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      padding: var(--space-5);
      background: var(--color-bg);
      color: var(--color-text);
      font-family: var(--font-ui);
    }

    .auth-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      max-width: var(--content-max-width);
      margin: 0 auto;
    }

    .auth-header__brand {
      color: var(--color-primary-text);
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      text-decoration: none;
    }

    .auth-header__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-4);
    }

    .auth-header__back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: var(--touch-target);
      font-weight: var(--font-weight-bold);
    }

    .auth-main {
      max-width: 40rem;
      margin: var(--space-12) auto 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {}
