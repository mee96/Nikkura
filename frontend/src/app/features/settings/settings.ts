import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageSwitch } from '../../shared/language-switch/language-switch';

/**
 * Settings. For now only the language, which on mobile has no other place
 * (the sidebar with the switch is hidden there). Profile options arrive with accounts (M2).
 */
@Component({
  selector: 'app-settings',
  imports: [TranslocoPipe, LanguageSwitch],
  template: `
    <h1 class="settings__title">{{ 'nav.settings' | transloco }}</h1>

    <section class="panel" aria-labelledby="language-title">
      <h2 id="language-title" class="panel__title">{{ 'language.label' | transloco }}</h2>
      <p class="panel__text">{{ 'settings.languageText' | transloco }}</p>
      <app-language-switch />
    </section>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .settings__title {
      font-size: var(--text-2xl);
    }

    .panel {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-6);
      border: var(--border-width) solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    .panel__title {
      font-size: var(--text-lg);
    }

    .panel__text {
      margin: 0;
      color: var(--color-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {}
