import { Injectable, computed, inject, signal } from '@angular/core';
import type { User } from 'firebase/auth';

import { FIREBASE_AUTH } from './firebase-auth';

/**
 * Who is logged in. `undefined` means Firebase has not answered yet (the first
 * moments after the page opens); `null` means nobody is logged in.
 */
type AuthState = User | null | undefined;

/** Login, logout and the current user, as signals. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly state = signal<AuthState>(undefined);
  private readonly firstAnswer = new Promise<void>((resolve) => {
    this.auth.onUserChange((user) => {
      this.state.set(user);
      resolve();
    });
  });

  /** The logged-in user, or `null` (also while Firebase has not answered yet). */
  readonly user = computed(() => this.state() ?? null);
  readonly isLoggedIn = computed(() => this.user() !== null);
  /** False until Firebase has told us whether someone is logged in. */
  readonly isReady = computed(() => this.state() !== undefined);

  /** Resolves once we know whether someone is logged in (used by the guard). */
  whenReady(): Promise<void> {
    return this.firstAnswer;
  }

  async logIn(email: string, password: string): Promise<void> {
    await this.auth.logIn(email, password);
  }

  async signUp(email: string, password: string, displayName: string): Promise<void> {
    await this.auth.signUp(email, password, displayName);
  }

  async logInWithGoogle(): Promise<void> {
    await this.auth.logInWithGoogle();
  }

  /** Emails a link to choose a new password. */
  async resetPassword(email: string): Promise<void> {
    await this.auth.resetPassword(email);
  }

  async logOut(): Promise<void> {
    await this.auth.logOut();
  }

  /** The logged-in user right now, straight from Firebase, or `null`. */
  currentUser(): User | null {
    return this.auth.currentUser();
  }

  /** A fresh ID token for the backend, or `null` when nobody is logged in. */
  async idToken(): Promise<string | null> {
    const user = this.auth.currentUser();
    return user ? user.getIdToken() : null;
  }
}
