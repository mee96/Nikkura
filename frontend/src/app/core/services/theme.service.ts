import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

/** The four themes of Nikkura. `guest` is the visitor without an account. */
export const ROLES = ['moe', 'haku', 'senpai', 'guest'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Applies the active theme by setting `data-role` on `<body>`.
 * All colours, fonts and radii live in `src/styles/variables.css` and
 * change with that attribute, so components never need to know the role.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly activeRole = signal<Role>('guest');

  /** The current theme, read-only for components. */
  readonly role = this.activeRole.asReadonly();

  constructor() {
    effect(() => {
      this.document.body.dataset['role'] = this.activeRole();
    });
  }

  setRole(role: Role): void {
    this.activeRole.set(role);
  }
}
