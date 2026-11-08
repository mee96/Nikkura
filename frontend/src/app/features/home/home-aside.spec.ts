import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { ThemeService } from '../../core/services/theme.service';
import { HomeAside } from './home-aside';

describe('HomeAside', () => {
  let fixture: ComponentFixture<HomeAside>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeAside, provideTranslocoTesting()],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeAside);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('invites visitors to pick one of the three roles', () => {
    const roles = Array.from(element.querySelectorAll('.roles__item')).map((item) =>
      item.textContent?.trim(),
    );

    expect(element.querySelector('h2')?.textContent).toContain('Save, rate and comment');
    expect(roles).toEqual(['Moe Magical', 'Haku Sama', 'Senpai']);
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/signup');
  });

  it('paints each dot with its own role tokens', () => {
    const dots = Array.from(element.querySelectorAll('.roles__dot'));

    expect(dots.map((dot) => dot.getAttribute('data-role'))).toEqual(['moe', 'haku', 'senpai']);
  });

  it('shows the Kura card instead when a role is active', async () => {
    TestBed.inject(ThemeService).setRole('moe');
    await fixture.whenStable();

    expect(element.querySelector('h2')?.textContent).toContain('My Kura');
    expect(element.querySelector('a[href="/signup"]')).toBeNull();
  });
});
