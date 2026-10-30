import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

/** Same width as `bp.desktop` in src/styles/_breakpoints.scss. */
export const DESKTOP_QUERY = '(width >= 1200px)';

/**
 * Tells components which layout is on, for the few cases where CSS is not
 * enough (e.g. the filters are a side panel on desktop and a sheet below it).
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly desktop = signal(false);

  readonly isDesktop = this.desktop.asReadonly();

  constructor() {
    const query = this.window?.matchMedia?.(DESKTOP_QUERY);
    if (query) {
      this.desktop.set(query.matches);
      query.addEventListener('change', (event) => this.desktop.set(event.matches));
    }
  }
}
