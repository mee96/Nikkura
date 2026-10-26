import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { Shell } from './shell';

describe('Shell', () => {
  let fixture: ComponentFixture<Shell>;
  let element: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Shell, provideTranslocoTesting()],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(LanguageService).setLang('en');
    fixture = TestBed.createComponent(Shell);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  const texts = (selector: string) =>
    Array.from(element.querySelectorAll(selector)).map((node) => node.textContent?.trim());

  it('lists the five sections in the sidebar', () => {
    expect(texts('.sidebar .nav-link__label')).toEqual([
      'Home',
      'Explore',
      'Season',
      'My Kura',
      'Settings',
    ]);
  });

  it('keeps four tabs in the mobile navigation, with the short Kura label', () => {
    expect(texts('.bottom-nav .tab__label')).toEqual(['Home', 'Explore', 'Season', 'Kura']);
  });

  it('labels both navigations', () => {
    const navs = element.querySelectorAll('nav');
    expect(Array.from(navs).map((nav) => nav.getAttribute('aria-label'))).toEqual([
      'Main navigation',
      'Main navigation',
    ]);
  });

  it('invites visitors to sign up or log in', () => {
    expect(element.querySelector('.brand__tagline')?.textContent).toContain(
      'Explore without an account',
    );
    expect(element.querySelector('.sidebar a[href="/signup"]')).not.toBeNull();
    expect(element.querySelector('.sidebar a[href="/login"]')).not.toBeNull();
    expect(element.querySelector('.topbar__mobile a[href="/login"]')).not.toBeNull();
  });

  it('shows the role and the settings avatar instead when a role is active', async () => {
    TestBed.inject(ThemeService).setRole('haku');
    await fixture.whenStable();

    expect(element.querySelector('.brand__tagline')?.textContent).toContain('Role: Haku Sama');
    expect(element.querySelector('.sidebar a[href="/signup"]')).toBeNull();
    expect(element.querySelector('.avatar')?.getAttribute('aria-label')).toBe('Settings');
  });

  it('translates the frame when the language changes', async () => {
    TestBed.inject(LanguageService).setLang('es');
    TestBed.tick();
    await fixture.whenStable();

    expect(texts('.bottom-nav .tab__label')).toEqual(['Inicio', 'Explorar', 'Temporada', 'Kura']);
  });

  it('moves focus to the content with the skip link', () => {
    const skip = element.querySelector<HTMLAnchorElement>('.skip-link');
    skip?.click();

    expect(TestBed.inject(DOCUMENT).activeElement?.id).toBe('main');
  });

  it('has no side column until a page fills it', () => {
    expect(element.querySelector('.shell')?.classList).not.toContain('shell--with-aside');
  });
});
