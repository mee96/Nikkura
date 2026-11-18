import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideTranslocoTesting } from '../testing/transloco';
import { App } from './app';
import { FIREBASE_AUTH } from './core/auth/firebase-auth';

/** Nobody is logged in, so the app starts with the visitor theme. */
const NOBODY = {
  onUserChange: (listener: (user: null) => void) => listener(null),
  currentUser: () => null,
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, provideTranslocoTesting()],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FIREBASE_AUTH, useValue: NOBODY },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('applies the visitor theme on <body> at startup', () => {
    TestBed.createComponent(App);
    TestBed.tick();

    expect(TestBed.inject(DOCUMENT).body.dataset['role']).toBe('guest');
  });

  it('sets <html lang> at startup', () => {
    TestBed.createComponent(App);
    TestBed.tick();

    expect(['ca', 'es', 'en']).toContain(TestBed.inject(DOCUMENT).documentElement.lang);
  });
});
