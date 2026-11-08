import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LanguageService } from '../../core/services/language.service';
import { LanguageMenu } from './language-menu';

describe('LanguageMenu', () => {
  let fixture: ComponentFixture<LanguageMenu>;
  let element: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [LanguageMenu, provideTranslocoTesting()] });
    TestBed.inject(LanguageService).setLang('en');
    fixture = TestBed.createComponent(LanguageMenu);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  const trigger = () => element.querySelector<HTMLButtonElement>('.menu__button')!;
  const options = () => [...element.querySelectorAll<HTMLButtonElement>('.menu__option')];
  const settle = async () => {
    TestBed.tick();
    await fixture.whenStable();
  };

  it('starts closed, with a button named after the current language', () => {
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().getAttribute('aria-label')).toBe('Language: English');
    expect(options()).toHaveLength(0);
  });

  it('opens a list with each language in its own language', async () => {
    trigger().click();
    await settle();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(options().map((option) => option.textContent?.trim())).toEqual([
      'Català',
      'Castellano',
      'English',
    ]);
    expect(options()[2].getAttribute('aria-pressed')).toBe('true');
  });

  it('changes the language and closes', async () => {
    trigger().click();
    await settle();
    options()[0].click();
    await settle();

    expect(TestBed.inject(LanguageService).lang()).toBe('ca');
    expect(options()).toHaveLength(0);
    expect(trigger().getAttribute('aria-label')).toBe('Idioma: Català');
  });

  it('closes on Escape and gives the focus back to the button', async () => {
    trigger().click();
    await settle();
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();

    expect(options()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger());
  });

  it('closes when the person clicks somewhere else', async () => {
    document.body.append(element);
    trigger().click();
    await settle();
    document.body.click();
    await settle();

    expect(options()).toHaveLength(0);
    element.remove();
  });
});
