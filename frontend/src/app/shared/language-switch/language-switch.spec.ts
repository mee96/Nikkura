import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LanguageService } from '../../core/services/language.service';
import { LanguageSwitch } from './language-switch';

describe('LanguageSwitch', () => {
  let fixture: ComponentFixture<LanguageSwitch>;
  let element: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LanguageSwitch, provideTranslocoTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(LanguageSwitch);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  function buttons(): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll('button'));
  }

  it('shows CA, ES and EN, each labelled in its own language', () => {
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['CA', 'ES', 'EN']);
    expect(buttons().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Català',
      'Castellano',
      'English',
    ]);
    expect(buttons().map((b) => b.getAttribute('lang'))).toEqual(['ca', 'es', 'en']);
  });

  it('changes the language and marks the pressed option', async () => {
    buttons()[1].click();
    await fixture.whenStable();

    expect(TestBed.inject(LanguageService).lang()).toBe('es');
    expect(buttons()[1].getAttribute('aria-pressed')).toBe('true');
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
  });
});
