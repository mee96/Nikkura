import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import type { User } from 'firebase/auth';

import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ROLES, Role, ThemeService } from '../../core/services/theme.service';
import { RecommendedRole } from '../home/role-genres';

export const USERNAME_MIN = 2;
export const USERNAME_MAX = 24;
export const PASSWORD_MIN = 8;

/** The roles a new account can choose (the visitor look is for people without an account). */
export const SIGNUP_ROLES = ROLES.filter((role): role is RecommendedRole => role !== 'guest');

/**
 * Translation key of the message for a Firebase error while creating an account,
 * or `null` when nothing should be shown (the person closed the Google window).
 */
export function signupErrorKey(error: unknown): string | null {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case 'auth/email-already-in-use':
      return 'signup.errors.emailInUse';
    case 'auth/invalid-email':
      return 'signup.errors.invalidEmail';
    case 'auth/weak-password':
      return 'signup.errors.weakPassword';
    case 'auth/too-many-requests':
      return 'signup.errors.tooMany';
    case 'auth/network-request-failed':
      return 'signup.errors.network';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null;
    default:
      return 'signup.errors.generic';
  }
}

/**
 * The username saved in the profile: the one typed, or else the name of the account
 * (Google) or the part of its email before the @. Never longer than the screen allows.
 */
export function profileUsername(
  typed: string,
  user: Pick<User, 'displayName' | 'email'> | null,
): string {
  const clean = (value: string) => value.trim().slice(0, USERNAME_MAX).trim();
  const candidates = [typed, user?.displayName ?? '', user?.email?.split('@')[0] ?? ''];
  return candidates.map(clean).find((name) => name.length >= USERNAME_MIN) ?? 'user';
}

/** The username counts without the spaces around it. */
function usernameLength(control: AbstractControl<string>): { username: true } | null {
  const length = control.value.trim().length;
  return length >= USERNAME_MIN && length <= USERNAME_MAX ? null : { username: true };
}

/**
 * The sign-up screen, inside the `AuthLayout` and with the same look as the login:
 * the welcome on the left and the form on the right. Username, email, password and
 * the role (the colours of the app), or Google. It asks for
 * nothing else: no age. Once the account exists in Firebase, the profile (username and
 * role) is created in the backend and the role it answers is applied. If saving the
 * profile fails the person stays logged in and can try again: only the profile call is
 * repeated, never the sign-up.
 */
@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
  template: `
    <div class="stage">
      <div class="copy">
        <p class="copy__title">
          {{ 'signup.heroStart' | transloco }}
          <span class="copy__accent">{{ 'signup.heroAccent' | transloco }}</span>
        </p>
      </div>

      <section class="auth-form" aria-labelledby="signup-title">
        <h1 id="signup-title" class="auth-form__title">{{ 'shell.signUp' | transloco }}</h1>
        <p class="auth-form__lead">{{ 'signup.lead' | transloco }}</p>

        <form class="auth-form__form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="field__label" for="signup-username">
              {{ 'signup.username' | transloco }}
            </label>
            <input
              id="signup-username"
              class="field__input"
              type="text"
              autocomplete="username"
              autocapitalize="none"
              spellcheck="false"
              formControlName="username"
              [maxLength]="usernameMax"
              [placeholder]="'signup.usernamePlaceholder' | transloco"
              [attr.aria-describedby]="'signup-username-hint'"
              [attr.aria-invalid]="form.controls.username.touched && form.controls.username.invalid"
            />
            <p id="signup-username-hint" class="field__hint">
              {{ 'signup.usernameHint' | transloco }}
            </p>
          </div>

          <div class="field">
            <label class="field__label" for="signup-email">{{ 'login.email' | transloco }}</label>
            <input
              id="signup-email"
              class="field__input"
              type="email"
              autocomplete="email"
              inputmode="email"
              formControlName="email"
              [placeholder]="'login.emailPlaceholder' | transloco"
              [attr.aria-invalid]="form.controls.email.touched && form.controls.email.invalid"
            />
          </div>

          <div class="field">
            <label class="field__label" for="signup-password">
              {{ 'login.password' | transloco }}
            </label>
            <div class="field__row">
              <input
                id="signup-password"
                class="field__input field__input--with-button"
                autocomplete="new-password"
                formControlName="password"
                placeholder="••••••••"
                aria-describedby="signup-password-hint"
                [type]="showPassword() ? 'text' : 'password'"
                [attr.aria-invalid]="
                  form.controls.password.touched && form.controls.password.invalid
                "
              />
              <button
                type="button"
                class="field__toggle"
                aria-controls="signup-password"
                (click)="showPassword.set(!showPassword())"
              >
                {{ (showPassword() ? 'login.hide' : 'login.show') | transloco }}
              </button>
            </div>
            <p id="signup-password-hint" class="field__hint">
              {{ 'signup.passwordHint' | transloco }}
            </p>
          </div>

          <fieldset class="roles">
            <legend class="field__label">{{ 'signup.roleTitle' | transloco }}</legend>
            <div class="roles__grid">
              @for (role of roles; track role) {
                <label class="role role--{{ role }}">
                  <input
                    class="role__input"
                    type="radio"
                    name="role"
                    formControlName="role"
                    [value]="role"
                    [attr.value]="role"
                  />
                  <span class="role__dots" aria-hidden="true">
                    <i class="role__dot"></i><i class="role__dot"></i><i class="role__dot"></i>
                  </span>
                  <span class="role__name">{{ 'roles.' + role | transloco }}</span>
                </label>
              }
            </div>
          </fieldset>

          @if (error(); as key) {
            <p class="auth-form__message auth-form__message--error" role="alert">
              {{ key | transloco }}
            </p>
          }

          @if (pendingProfile()) {
            <button
              type="button"
              class="button button--primary"
              [attr.aria-busy]="busy()"
              (click)="retry()"
            >
              {{ (busy() ? 'signup.submitting' : 'signup.retry') | transloco }}
            </button>
          } @else {
            <button type="submit" class="button button--primary" [attr.aria-busy]="busy()">
              {{ (busy() ? 'signup.submitting' : 'signup.submit') | transloco }}
              <svg
                class="button__arrow"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          }
        </form>

        @if (!pendingProfile()) {
          <div class="auth-form__or">
            <span>{{ 'login.or' | transloco }}</span>
          </div>

          <button type="button" class="button button--outline" (click)="google()">
            {{ 'signup.google' | transloco }}
          </button>
        }

        <p class="auth-form__links">
          {{ 'signup.haveAccount' | transloco }}
          <a class="auth-form__link" routerLink="/login">{{ 'shell.logIn' | transloco }}</a>
          <br />
          <a class="auth-form__link auth-form__link--small" routerLink="/">
            {{ 'login.continueAsGuest' | transloco }}
          </a>
        </p>
      </section>
    </div>
  `,
  styleUrls: ['../../layout/auth-layout/auth-form.scss', './signup.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Signup {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly profiles = inject(ProfileService);

  protected readonly roles = SIGNUP_ROLES;
  protected readonly usernameMax = USERNAME_MAX;

  protected readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [usernameLength] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        (control) => (/^\S+@\S+\.\S+$/.test(control.value.trim()) ? null : { email: true }),
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [(control) => (control.value.length >= PASSWORD_MIN ? null : { min: true })],
    }),
    role: new FormControl<RecommendedRole>('moe', { nonNullable: true }),
  });

  protected readonly showPassword = signal(false);
  protected readonly busy = signal(false);
  /** Translation key of the error being shown, if any. */
  protected readonly error = signal<string | null>(null);
  /** Set while the account exists but its profile is not saved yet: the screen then offers to retry. */
  protected readonly pendingProfile = signal<{ username: string; role: RecommendedRole } | null>(
    null,
  );

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(this.invalidKey());
      return;
    }
    const values = this.form.getRawValue();
    const username = values.username.trim();
    const created = await this.attempt(() =>
      this.auth.signUp(values.email.trim(), values.password, username),
    );
    if (created) await this.saveProfile(username, values.role);
  }

  protected async google(): Promise<void> {
    if (this.busy()) return;
    if (!(await this.attempt(() => this.auth.logInWithGoogle()))) return;
    const username = profileUsername(this.form.controls.username.value, this.auth.currentUser());
    await this.saveProfile(username, this.form.controls.role.value);
  }

  /** Tries again to save the profile of an account that is already created. */
  protected async retry(): Promise<void> {
    const pending = this.pendingProfile();
    if (pending && !this.busy()) await this.saveProfile(pending.username, pending.role);
  }

  /** The most useful message for a form that is not ready yet. */
  private invalidKey(): string {
    const { username, email, password } = this.form.controls;
    if (!username.value.trim() || !email.value.trim() || !password.value) {
      return 'signup.errors.missing';
    }
    if (email.invalid) return 'signup.errors.invalidEmail';
    if (username.invalid) return 'signup.errors.username';
    return 'signup.errors.shortPassword';
  }

  /** Runs one action showing "busy" meanwhile; says whether it worked. */
  private async attempt(action: () => Promise<unknown>): Promise<boolean> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await action();
      return true;
    } catch (error) {
      this.error.set(signupErrorKey(error));
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  /** Creates the profile in the backend, then applies the role it answers and goes to the home. */
  private async saveProfile(username: string, wanted: RecommendedRole): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    let role: Role;
    try {
      ({ role } = await this.profiles.create(username, wanted));
    } catch (error) {
      console.error('[Signup] Could not save the profile', error);
      this.pendingProfile.set({ username, role: wanted });
      this.error.set('signup.errors.profile');
      return;
    } finally {
      this.busy.set(false);
    }
    this.pendingProfile.set(null);
    await this.enter(role);
  }

  private enter(role: Role): Promise<boolean> {
    this.theme.setRole(role);
    return this.router.navigateByUrl('/');
  }
}
