import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { FALLBACK_LANG, LANG_STORAGE_KEY, Lang, isLang } from '../i18n/languages';

/**
 * Chooses and applies the interface language.
 *
 * Order of preference: the visitor's saved choice, then the first browser
 * language we support, then English. Every change updates Transloco and
 * `<html lang>`. Only a language the visitor picks is saved: a detected one
 * is not, so the page keeps following the browser until they choose.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly transloco = inject(TranslocoService);
  private readonly activeLang = signal<Lang>(this.initialLang());

  /** The current language, read-only for components. */
  readonly lang = this.activeLang.asReadonly();

  constructor() {
    effect(() => {
      const lang = this.activeLang();
      this.transloco.setActiveLang(lang);
      this.document.documentElement.lang = lang;
    });
  }

  /** Applies and remembers the visitor's choice. */
  setLang(lang: Lang): void {
    this.activeLang.set(lang);
    this.save(lang);
  }

  private initialLang(): Lang {
    const saved = this.read();
    if (isLang(saved)) {
      return saved;
    }
    const browserLangs = this.document.defaultView?.navigator.languages ?? [];
    for (const tag of browserLangs) {
      const base = tag.toLowerCase().split('-')[0];
      if (isLang(base)) {
        return base;
      }
    }
    return FALLBACK_LANG;
  }

  // localStorage can be missing or throw (private mode, blocked storage), so
  // the app keeps working with the browser language when it does.
  private read(): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(LANG_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private save(lang: Lang): void {
    try {
      this.document.defaultView?.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Nothing to do: the language still applies for this visit.
    }
  }
}
