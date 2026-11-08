import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LanguageService } from '../../core/services/language.service';
import { Settings } from './settings';

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [Settings, provideTranslocoTesting()] });
    TestBed.inject(LanguageService).setLang('en');
  });

  afterEach(() => localStorage.clear());

  it('lets the visitor change the language, the only way to do it on mobile', async () => {
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Settings');
    expect(element.querySelector('h2')?.textContent).toContain('Language');

    element.querySelector<HTMLButtonElement>('button[lang="ca"]')?.click();
    TestBed.tick();
    await fixture.whenStable();

    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('ca');
    expect(element.querySelector('h1')?.textContent).toContain('Configuració');
  });
});
