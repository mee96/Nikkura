import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LanguageService } from '../services/language.service';
import { TranslatedTitleStrategy } from './translated-title.strategy';

@Component({ template: '' })
class Blank {}

describe('TranslatedTitleStrategy', () => {
  let harness: RouterTestingHarness;
  const title = () => TestBed.inject(Title).getTitle();

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [provideTranslocoTesting()],
      providers: [
        provideRouter([
          { path: 'season', title: 'nav.season', component: Blank },
          { path: 'untitled', component: Blank },
        ]),
        { provide: TitleStrategy, useExisting: TranslatedTitleStrategy },
      ],
    });
    TestBed.inject(LanguageService).setLang('en');
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => localStorage.clear());

  it('translates the route title and adds the app name', async () => {
    await harness.navigateByUrl('/season');

    expect(title()).toBe('Season · Nikkura');
  });

  it('uses just the app name for a route without title', async () => {
    await harness.navigateByUrl('/season');
    await harness.navigateByUrl('/untitled');

    expect(title()).toBe('Nikkura');
  });

  it('follows the language', async () => {
    await harness.navigateByUrl('/season');
    TestBed.inject(LanguageService).setLang('es');
    TestBed.tick();

    expect(title()).toBe('Temporada · Nikkura');
  });
});
