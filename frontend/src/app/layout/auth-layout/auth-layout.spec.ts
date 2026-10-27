import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthLayout } from './auth-layout';

describe('AuthLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AuthLayout, provideTranslocoTesting()],
      providers: [provideRouter([])],
    });
    TestBed.inject(LanguageService).setLang('en');
  });

  afterEach(() => localStorage.clear());

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(AuthLayout);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('always uses the visitor look, even when a role is active', async () => {
    TestBed.inject(ThemeService).setRole('senpai');

    expect((await render()).getAttribute('data-role')).toBe('guest');
  });

  it('has the brand, a way back to exploring and the language switch, but no app navigation', async () => {
    const element = await render();

    expect(element.querySelector('a[href="/"]')?.textContent).toContain('Nikkura');
    expect(element.querySelector('a[href="/explore"]')?.textContent).toContain('Back to exploring');
    expect(element.querySelector('app-language-switch')).not.toBeNull();
    expect(element.querySelector('nav')).toBeNull();
    expect(element.querySelector('main#main')).not.toBeNull();
  });
});
