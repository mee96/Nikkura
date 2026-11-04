import { InjectionToken } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
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
  /** Creates the account and saves the username as the display name. */
  signUp(email: string, password: string, displayName: string): Promise<unknown>;
  logInWithGoogle(): Promise<unknown>;
  /** Sends the "choose a new password" email. */
  resetPassword(email: string): Promise<void>;
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
      signUp: async (email, password, displayName) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName });
        return credential;
      },
      logInWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
      resetPassword: (email) => sendPasswordResetEmail(auth, email),
      logOut: () => signOut(auth),
    };
  },
});
