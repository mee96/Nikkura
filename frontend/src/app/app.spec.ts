import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
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
});
