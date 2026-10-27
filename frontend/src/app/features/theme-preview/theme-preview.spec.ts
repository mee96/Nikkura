import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { ThemePreview } from './theme-preview';

describe('ThemePreview', () => {
  let fixture: ComponentFixture<ThemePreview>;
  let element: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ThemePreview, provideTranslocoTesting()],
    }).compileComponents();
    TestBed.inject(LanguageService).setLang('en');
    fixture = TestBed.createComponent(ThemePreview);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows one button per theme', () => {
    const buttons = element.querySelectorAll('.switcher__button');
    expect(buttons.length).toBe(4);
  });

  it('switches the theme when a button is pressed', async () => {
    const haku = Array.from(element.querySelectorAll<HTMLButtonElement>('.switcher__button')).find(
      (button) => button.textContent?.trim() === 'Haku Sama',
    );

    haku?.click();
    await fixture.whenStable();

    expect(TestBed.inject(ThemeService).role()).toBe('haku');
    expect(haku?.getAttribute('aria-pressed')).toBe('true');
  });

  it('translates its texts when the language changes', async () => {
    const kicker = () => element.querySelector('.hero__kicker')?.textContent?.trim();
    expect(kicker()).toBe('Featured for you');

    TestBed.inject(LanguageService).setLang('ca');
    TestBed.tick();
    await fixture.whenStable();

    expect(kicker()).toBe('Destacat per a tu');
  });

  it('translates genre chips', async () => {
    TestBed.inject(LanguageService).setLang('es');
    TestBed.tick();
    await fixture.whenStable();

    expect(element.textContent).toContain('Fantasía');
  });
});
