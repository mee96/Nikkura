import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeService } from '../../core/services/theme.service';
import { ThemePreview } from './theme-preview';

describe('ThemePreview', () => {
  let fixture: ComponentFixture<ThemePreview>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ThemePreview] }).compileComponents();
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
});
