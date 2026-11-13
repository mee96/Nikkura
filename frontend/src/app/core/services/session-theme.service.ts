import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, untracked } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { ProfileService } from './profile.service';
import { ThemeService } from './theme.service';

/**
 * Keeps the theme in step with the session: the role of the profile while
 * someone is logged in (also after reloading the page) and the visitor theme
 * when nobody is.
 */
@Injectable({ providedIn: 'root' })
export class SessionThemeService {
  private readonly auth = inject(AuthService);
  private readonly profiles = inject(ProfileService);
  private readonly theme = inject(ThemeService);

  /** Only changes when the person does, so a new token never asks for the profile again. */
  private readonly uid = computed(() => this.auth.user()?.uid ?? null);

  constructor() {
    effect(() => {
      const uid = this.uid();
      untracked(() => void this.apply(uid));
    });
  }

  private async apply(uid: string | null): Promise<void> {
    if (uid === null) {
      this.theme.setRole('guest');
      return;
    }
    try {
      const { role } = await this.profiles.get();
      // The answer is for someone who may have logged out (or been replaced) meanwhile.
      if (this.uid() === uid) this.theme.setRole(role);
    } catch (error) {
      // Signing up creates the account first and the profile right after: a 404
      // here is expected, and the sign-up screen applies the role itself.
      if (error instanceof HttpErrorResponse && error.status === 404) return;
      console.error('[SessionTheme] Could not read the profile to apply the theme', error);
    }
  }
}
