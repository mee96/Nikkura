import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../core/auth/auth.service';

/**
 * Where to go after logging in: the page the guard sent the person away from
 * (`?returnUrl=`), but only a path inside Nikkura, never another site.
 */
export function safeReturnUrl(url: string | undefined): string {
  const isOwnPath = !!url && url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
  return isOwnPath ? url : '/';
}

/**
 * Translation key of the message for a Firebase error, or `null` when nothing
 * should be shown (the person closed the Google window on purpose).
 */
export function authErrorKey(error: unknown): string | null {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'login.errors.credentials';
    case 'auth/too-many-requests':
      return 'login.errors.tooMany';
    case 'auth/network-request-failed':
      return 'login.errors.network';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null;
    default:
      return 'login.errors.generic';
  }
}

/**
 * The login screen, inside the `AuthLayout`: a big welcome on the left and the form
 * on a card on the right. Log in with email and password or with Google, ask for a new
 * password, or go on without an account. It asks for nothing else: no age, no role
 * (the role is chosen when signing up).
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
  template: `
    <div class="stage">
      <div class="copy">
        <p class="copy__title">
          {{ 'login.heroStart' | transloco }}
          <span class="copy__accent">{{ 'login.heroAccent' | transloco }}</span>
        </p>
      </div>

      <section class="auth-form" aria-labelledby="login-title">
        <h1 id="login-title" class="auth-form__title">{{ 'shell.logIn' | transloco }}</h1>
        <p class="auth-form__lead">{{ 'login.lead' | transloco }}</p>

        <form class="auth-form__form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="field__label" for="login-email">{{ 'login.email' | transloco }}</label>
            <input
              id="login-email"
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
            <label class="field__label" for="login-password">
              {{ 'login.password' | transloco }}
            </label>
            <div class="field__row">
              <input
                id="login-password"
                class="field__input field__input--with-button"
                autocomplete="current-password"
                formControlName="password"
                placeholder="••••••••"
                [type]="showPassword() ? 'text' : 'password'"
                [attr.aria-invalid]="
                  form.controls.password.touched && form.controls.password.invalid
                "
              />
              <button
                type="button"
                class="field__toggle"
                aria-controls="login-password"
                (click)="showPassword.set(!showPassword())"
              >
                {{ (showPassword() ? 'login.hide' : 'login.show') | transloco }}
              </button>
            </div>
            <button type="button" class="login__forgot" (click)="forgot()">
              {{ 'login.forgot' | transloco }}
            </button>
          </div>

          @if (error(); as key) {
            <p class="auth-form__message auth-form__message--error" role="alert">
              {{ key | transloco }}
            </p>
          }
          @if (notice(); as key) {
            <p class="auth-form__message" role="status">{{ key | transloco }}</p>
          }

          <button type="submit" class="button button--primary" [attr.aria-busy]="busy()">
            {{ (busy() ? 'login.submitting' : 'shell.logIn') | transloco }}
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
        </form>

        <div class="auth-form__or">
          <span>{{ 'login.or' | transloco }}</span>
        </div>

        <button type="button" class="button button--outline" (click)="google()">
          {{ 'login.google' | transloco }}
        </button>

        <p class="auth-form__links">
          {{ 'login.noAccount' | transloco }}
          <a class="auth-form__link" routerLink="/signup">{{ 'login.createOne' | transloco }}</a>
          <br />
          <a class="auth-form__link auth-form__link--small" routerLink="/">
            {{ 'login.continueAsGuest' | transloco }}
          </a>
        </p>
      </section>
    </div>
  `,
  styleUrls: ['../../layout/auth-layout/auth-form.scss', './login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** `?returnUrl=` from the route guard. */
  readonly returnUrl = input<string>();

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly showPassword = signal(false);
  protected readonly busy = signal(false);
  /** Translation key of the error being shown, if any. */
  protected readonly error = signal<string | null>(null);
  /** Translation key of the good news being shown, if any. */
  protected readonly notice = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notice.set(null);
      this.error.set('login.errors.missing');
      return;
    }
    const { email, password } = this.form.getRawValue();
    if (await this.attempt(() => this.auth.logIn(email, password))) await this.enter();
  }

  protected async google(): Promise<void> {
    if (this.busy()) return;
    if (await this.attempt(() => this.auth.logInWithGoogle())) await this.enter();
  }

  protected async forgot(): Promise<void> {
    if (this.busy()) return;
    const email = this.form.controls.email;
    if (email.invalid) {
      email.markAsTouched();
      this.notice.set(null);
      this.error.set('login.errors.resetEmail');
      return;
    }
    if (await this.attempt(() => this.auth.resetPassword(email.value))) {
      this.notice.set('login.resetSent');
    }
  }

  /** Runs one action showing "busy" meanwhile; says whether it worked. */
  private async attempt(action: () => Promise<unknown>): Promise<boolean> {
    this.busy.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      await action();
      return true;
    } catch (error) {
      this.error.set(authErrorKey(error));
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  private enter(): Promise<boolean> {
    return this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
  }
}
