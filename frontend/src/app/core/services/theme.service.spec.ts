import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ROLES, ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let body: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    body = TestBed.inject(DOCUMENT).body;
  });

  it('starts with the visitor theme', () => {
    TestBed.tick();

    expect(service.role()).toBe('guest');
    expect(body.dataset['role']).toBe('guest');
  });

  it.each(ROLES)('sets data-role="%s" on <body>', (role) => {
    service.setRole(role);
    TestBed.tick();

    expect(service.role()).toBe(role);
    expect(body.getAttribute('data-role')).toBe(role);
  });
});
