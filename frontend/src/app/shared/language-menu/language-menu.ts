import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LANGUAGES } from '../../core/i18n/languages';
import { LanguageService } from '../../core/services/language.service';
import { Icon } from '../icon/icon';

/**
 * Language picker for screens with little room: one round globe button that opens a
 * small list. Each option is written (and announced) in its own language. The list
 * closes on a choice, on Escape (the focus goes back to the button) and on a click
 * anywhere else.
 */
@Component({
  selector: 'app-language-menu',
  imports: [TranslocoPipe, Icon],
  host: {
    '(document:click)': 'closeOnOutsideClick($event)',
    '(keydown.escape)': 'close(true)',
  },
  template: `
    <button
      #trigger
      type="button"
      class="menu__button"
      aria-controls="language-menu-list"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="('language.label' | transloco) + ': ' + current().label"
      (click)="open.set(!open())"
    >
      <app-icon name="globe" />
    </button>
    @if (open()) {
      <ul id="language-menu-list" class="menu__list">
        @for (language of languages; track language.code) {
          <li>
            <button
              type="button"
              class="menu__option"
              [attr.lang]="language.code"
              [attr.aria-pressed]="languageService.lang() === language.code"
              (click)="choose(language.code)"
            >
              {{ language.label }}
              @if (languageService.lang() === language.code) {
                <app-icon name="check" />
              }
            </button>
          </li>
        }
      </ul>
    }
  `,
  styleUrl: './language-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageMenu {
  protected readonly languageService = inject(LanguageService);
  protected readonly languages = LANGUAGES;
  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected current() {
    return LANGUAGES.find((language) => language.code === this.languageService.lang())!;
  }

  protected choose(code: (typeof LANGUAGES)[number]['code']): void {
    this.languageService.setLang(code);
    this.close(true);
  }

  protected close(returnFocus: boolean): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    if (returnFocus) {
      this.trigger().nativeElement.focus();
    }
  }

  protected closeOnOutsideClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close(false);
    }
  }
}
