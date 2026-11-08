import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LANGUAGES } from '../../core/i18n/languages';
import { LanguageService } from '../../core/services/language.service';

/** CA · ES · EN switch. Each option is written and announced in its own language. */
@Component({
  selector: 'app-language-switch',
  imports: [TranslocoPipe],
  template: `
    <div class="switch" role="group" [attr.aria-label]="'language.label' | transloco">
      @for (language of languages; track language.code) {
        <button
          type="button"
          class="switch__option"
          [attr.lang]="language.code"
          [attr.title]="language.label"
          [attr.aria-label]="language.label"
          [attr.aria-pressed]="languageService.lang() === language.code"
          (click)="languageService.setLang(language.code)"
        >
          {{ language.code.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styleUrl: './language-switch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitch {
  protected readonly languageService = inject(LanguageService);
  protected readonly languages = LANGUAGES;
}
