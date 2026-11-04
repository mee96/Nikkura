import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideTranslocoTesting } from '../testing/transloco';
import { routes } from './app.routes';
import { AUTH_VIDEO_URL } from './core/auth/auth-media';
import { FIREBASE_AUTH, FirebaseAuthApi } from './core/auth/firebase-auth';
import { TranslatedTitleStrategy } from './core/i18n/translated-title.strategy';
import { LanguageService } from './core/services/language.service';

const fakeFirebase: FirebaseAuthApi = {
  onUserChange: (listener) => listener(null),
  currentUser: () => null,
  logIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  logInWithGoogle: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
};

describe('app routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [provideTranslocoTesting()],
      providers: [
        // Explore asks Jikan; the testing backend keeps those requests local.
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: TranslatedTitleStrategy },
        // Login talks to Firebase and the frame loads a video: neither is wanted in a test.
        { provide: FIREBASE_AUTH, useValue: fakeFirebase },
        { provide: AUTH_VIDEO_URL, useValue: '' },
      ],
    });
    TestBed.inject(LanguageService).setLang('en');
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => localStorage.clear());

  it('shows the home inside the shell, with the side column', async () => {
    await harness.navigateByUrl('/');

    expect(document.querySelector('app-shell')).not.toBeNull();
    expect(document.querySelector('app-home-aside')).not.toBeNull();
    expect(document.querySelector('.shell')?.classList).toContain('shell--with-aside');
  });

  it('has no side column on pages that do not fill it', async () => {
    await harness.navigateByUrl('/explore');

    expect(document.querySelector('app-explore h1')?.textContent).toContain('Explore');
    expect(document.querySelector('app-home-aside')).toBeNull();
    expect(document.querySelector('.shell')?.classList).not.toContain('shell--with-aside');
  });

  it.each([
    ['/season', 'Season'],
    ['/kura', 'My Kura'],
    ['/settings', 'Settings'],
  ])('routes %s', async (url, heading) => {
    await harness.navigateByUrl(url);

    expect(document.querySelector('main h1')?.textContent).toContain(heading);
  });

  it('shows the login screen outside the shell, always in its own look', async () => {
    await harness.navigateByUrl('/login');

    expect(document.querySelector('app-shell')).toBeNull();
    expect(document.querySelector('app-auth-layout')?.getAttribute('data-role')).toBe('auth');
    expect(document.querySelector('main app-login form')).not.toBeNull();
    expect(document.querySelector('main h1')?.textContent).toContain('Log in');
  });

  it('shows sign-up outside the shell', async () => {
    await harness.navigateByUrl('/signup');

    expect(document.querySelector('app-shell')).toBeNull();
    expect(document.querySelector('main h1')?.textContent).toContain('Create an account');
  });

  it('sends unknown URLs to the home', async () => {
    await harness.navigateByUrl('/nope');

    expect(TestBed.inject(Title).getTitle()).toBe('Home · Nikkura');
  });

  it('translates the tab title and follows the language', async () => {
    await harness.navigateByUrl('/explore');
    expect(TestBed.inject(Title).getTitle()).toBe('Explore · Nikkura');

    TestBed.inject(LanguageService).setLang('ca');
    TestBed.tick();

    expect(TestBed.inject(Title).getTitle()).toBe('Explorar · Nikkura');
  });
});
