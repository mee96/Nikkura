import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let loggedIn: ReturnType<typeof signal<boolean>>;
  let ready: Promise<void>;

  const run = (url = '/kura') =>
    TestBed.runInInjectionContext(() => authGuard({} as never, { url } as never)) as Promise<
      boolean | UrlTree
    >;

  beforeEach(() => {
    loggedIn = signal(false);
    ready = Promise.resolve();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: loggedIn, whenReady: () => ready } },
      ],
    });
  });

  it('lets logged-in users in', async () => {
    loggedIn.set(true);
    expect(await run()).toBe(true);
  });

  it('sends visitors to the login page, remembering where they wanted to go', async () => {
    const result = await run('/kura?tab=saved');

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      '/login?returnUrl=%2Fkura%3Ftab%3Dsaved',
    );
  });

  it('waits until Firebase has answered before deciding', async () => {
    let answer!: () => void;
    ready = new Promise<void>((resolve) => (answer = resolve));
    let decided = false;
    const pending = run().then((result) => {
      decided = true;
      return result;
    });

    await Promise.resolve();
    expect(decided).toBe(false);

    loggedIn.set(true);
    answer();
    expect(await pending).toBe(true);
  });
});
