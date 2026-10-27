import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';

const APP_NAME = 'Nikkura';

/**
 * Route `title`s are translation keys. This strategy translates them, adds the
 * app name ("Explorar · Nikkura") and updates the tab title when the language changes.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private readonly key$ = new BehaviorSubject<string | undefined>(undefined);

  constructor() {
    super();
    this.key$
      .pipe(
        switchMap((key) =>
          key
            ? this.transloco
                .selectTranslate<string>(key)
                .pipe(map((text) => `${text} · ${APP_NAME}`))
            : of(APP_NAME),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((text) => this.title.setTitle(text));
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.key$.next(this.buildTitle(snapshot));
  }
}
