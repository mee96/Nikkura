import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { environment } from '../../../environments/environment';

/**
 * The few things Nikkura uses from Firebase Auth. `AuthService` only talks to
 * this, so tests give it a fake one and never load the real SDK.
 */
export interface FirebaseAuthApi {
  /** Calls `listener` now and on every change; `null` means nobody is logged in. */
  onUserChange(listener: (user: User | null) => void): void;
  currentUser(): User | null;
  logIn(email: string, password: string): Promise<unknown>;
  signUp(email: string, password: string): Promise<unknown>;
  logInWithGoogle(): Promise<unknown>;
  logOut(): Promise<void>;
}

/** The real Firebase Auth, created the first time it is injected. */
export const FIREBASE_AUTH = new InjectionToken<FirebaseAuthApi>('FIREBASE_AUTH', {
  providedIn: 'root',
  factory: () => {
    const auth = getAuth(initializeApp(environment.firebase));
    return {
      onUserChange: (listener) => void onAuthStateChanged(auth, listener),
      currentUser: () => auth.currentUser,
      logIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
      logInWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
      logOut: () => signOut(auth),
    };
  },
});
