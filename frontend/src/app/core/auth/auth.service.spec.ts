import { TestBed } from '@angular/core/testing';
import type { User } from 'firebase/auth';

import { AuthService } from './auth.service';
import { FIREBASE_AUTH, FirebaseAuthApi } from './firebase-auth';

describe('AuthService', () => {
  let listener: (user: User | null) => void;
  let current: User | null;
  let firebase: {
    [K in keyof FirebaseAuthApi]: ReturnType<typeof vi.fn<FirebaseAuthApi[K]>>;
  };

  const fakeUser = (token = 'token-1') =>
    ({ uid: 'u1', getIdToken: vi.fn().mockResolvedValue(token) }) as unknown as User;
  const create = () => TestBed.inject(AuthService);

  beforeEach(() => {
    current = null;
    firebase = {
      onUserChange: vi.fn((callback) => void (listener = callback)),
      currentUser: vi.fn(() => current),
      logIn: vi.fn(() => Promise.resolve()),
      signUp: vi.fn(() => Promise.resolve()),
      logInWithGoogle: vi.fn(() => Promise.resolve()),
      resetPassword: vi.fn(() => Promise.resolve()),
      logOut: vi.fn(() => Promise.resolve()),
    };
    TestBed.configureTestingModule({ providers: [{ provide: FIREBASE_AUTH, useValue: firebase }] });
  });

  it('is not ready until Firebase answers, and nobody is logged in meanwhile', () => {
    const auth = create();

    expect(auth.isReady()).toBe(false);
    expect(auth.user()).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('follows the user Firebase reports', async () => {
    const auth = create();
    const user = fakeUser();

    listener(user);
    await auth.whenReady();
    expect(auth.isReady()).toBe(true);
    expect(auth.user()).toBe(user);
    expect(auth.isLoggedIn()).toBe(true);

    listener(null);
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.isReady()).toBe(true);
  });

  it('resolves whenReady for visitors too', async () => {
    const auth = create();
    listener(null);

    await expect(auth.whenReady()).resolves.toBeUndefined();
  });

  it('logs in with email and password', async () => {
    await create().logIn('a@b.com', 'secret1');
    expect(firebase.logIn).toHaveBeenCalledWith('a@b.com', 'secret1');
  });

  it('signs up with email and password', async () => {
    await create().signUp('a@b.com', 'secret1');
    expect(firebase.signUp).toHaveBeenCalledWith('a@b.com', 'secret1');
  });

  it('logs in with Google', async () => {
    await create().logInWithGoogle();
    expect(firebase.logInWithGoogle).toHaveBeenCalledOnce();
  });

  it('asks Firebase to email a new-password link', async () => {
    await create().resetPassword('a@b.com');
    expect(firebase.resetPassword).toHaveBeenCalledWith('a@b.com');
  });

  it('logs out', async () => {
    await create().logOut();
    expect(firebase.logOut).toHaveBeenCalledOnce();
  });

  it('passes on Firebase errors so the screen can show them', async () => {
    firebase.logIn.mockRejectedValue({ code: 'auth/invalid-credential' });
    await expect(create().logIn('a@b.com', 'bad')).rejects.toEqual({
      code: 'auth/invalid-credential',
    });
  });

  describe('idToken', () => {
    it('is null when nobody is logged in', async () => {
      await expect(create().idToken()).resolves.toBeNull();
    });

    it('asks the current user for a fresh token', async () => {
      current = fakeUser('fresh');
      await expect(create().idToken()).resolves.toBe('fresh');
    });
  });
});
