import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { User } from 'firebase/auth';

import { FIREBASE_AUTH } from '../auth/firebase-auth';
import { UserProfile } from '../models/profile.model';
import { ProfileService } from './profile.service';
import { SessionThemeService } from './session-theme.service';
import { ThemeService } from './theme.service';

describe('SessionThemeService', () => {
  let listener: (user: User | null) => void;
  let get: ReturnType<typeof vi.fn<() => Promise<UserProfile>>>;

  const user = (uid: string) => ({ uid }) as unknown as User;
  const profile = (role: UserProfile['role']): UserProfile => ({
    uid: 'u1',
    username: 'Ana',
    email: 'ana@example.com',
    role,
  });
  const theme = () => TestBed.inject(ThemeService);
  /** Tells the service who is logged in and lets its effect run. */
  const sessionIs = (who: User | null) => {
    listener(who);
    TestBed.tick();
  };

  beforeEach(() => {
    get = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FIREBASE_AUTH,
          useValue: {
            onUserChange: (callback: (user: User | null) => void) => void (listener = callback),
            currentUser: () => null,
          },
        },
        { provide: ProfileService, useValue: { get } },
      ],
    });
    TestBed.inject(SessionThemeService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('keeps the visitor theme while nobody is logged in', () => {
    sessionIs(null);

    expect(theme().role()).toBe('guest');
    expect(get).not.toHaveBeenCalled();
  });

  it.each(['moe', 'haku', 'senpai'] as const)(
    'applies the %s theme of the profile when someone is logged in',
    async (role) => {
      get.mockResolvedValue(profile(role));

      sessionIs(user('u1'));

      await vi.waitFor(() => expect(theme().role()).toBe(role));
    },
  );

  it('goes back to the visitor theme when the person logs out', async () => {
    get.mockResolvedValue(profile('haku'));
    sessionIs(user('u1'));
    await vi.waitFor(() => expect(theme().role()).toBe('haku'));

    sessionIs(null);

    expect(theme().role()).toBe('guest');
  });

  it('ignores a profile that arrives after the person logged out', async () => {
    let answer!: (value: UserProfile) => void;
    get.mockReturnValue(new Promise<UserProfile>((resolve) => (answer = resolve)));
    sessionIs(user('u1'));

    sessionIs(null);
    answer(profile('senpai'));
    await Promise.resolve();

    expect(theme().role()).toBe('guest');
  });

  it('keeps the current theme without complaining while the profile does not exist yet', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    theme().setRole('moe'); // what the sign-up screen does once the profile is created
    get.mockRejectedValue(new HttpErrorResponse({ status: 404 }));

    sessionIs(user('u1'));
    await vi.waitFor(() => expect(get).toHaveBeenCalledOnce());
    await Promise.resolve();

    expect(theme().role()).toBe('moe');
    expect(log).not.toHaveBeenCalled();
  });

  it('keeps the visitor theme and logs the error when the profile cannot be read', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    get.mockRejectedValue(new HttpErrorResponse({ status: 503 }));

    sessionIs(user('u1'));

    await vi.waitFor(() => expect(log).toHaveBeenCalledOnce());
    expect(theme().role()).toBe('guest');
  });
});
