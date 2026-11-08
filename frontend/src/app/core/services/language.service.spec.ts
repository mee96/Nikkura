import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LANG_STORAGE_KEY } from '../i18n/languages';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let browserLanguages: string[];

  function create(): LanguageService {
    TestBed.configureTestingModule({ imports: [provideTranslocoTesting()] });
    const service = TestBed.inject(LanguageService);
    TestBed.tick();
    return service;
  }

  beforeEach(() => {
    localStorage.clear();
    browserLanguages = ['en-US'];
    vi.spyOn(navigator, 'languages', 'get').mockImplementation(() => browserLanguages);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('uses the first supported browser language', () => {
    browserLanguages = ['fr-FR', 'es-ES', 'en'];

    expect(create().lang()).toBe('es');
  });

  it('falls back to English when no browser language is supported', () => {
    browserLanguages = ['fr-FR', 'de'];

    expect(create().lang()).toBe('en');
  });

  it('prefers the saved choice over the browser language', () => {
    browserLanguages = ['es-ES'];
    localStorage.setItem(LANG_STORAGE_KEY, 'ca');

    expect(create().lang()).toBe('ca');
  });

  it('ignores a saved value that is not one of our languages', () => {
    browserLanguages = ['ca-ES'];
    localStorage.setItem(LANG_STORAGE_KEY, 'fr');

    expect(create().lang()).toBe('ca');
  });

  it('applies the detected language without saving it', () => {
    browserLanguages = ['es-ES'];
    create();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('es');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('es');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBeNull();
  });

  it('keeps working when the browser blocks storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    browserLanguages = ['ca'];
    const service = create();

    expect(service.lang()).toBe('ca');
    expect(() => service.setLang('es')).not.toThrow();
    expect(service.lang()).toBe('es');
  });

  it('applies a new language to Transloco, <html lang> and the saved choice', () => {
    const service = create();

    service.setLang('ca');
    TestBed.tick();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('ca');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('ca');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ca');
  });
});
