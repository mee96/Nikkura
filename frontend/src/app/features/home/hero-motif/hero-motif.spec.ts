import { TestBed } from '@angular/core/testing';

import { Role, ThemeService } from '../../../core/services/theme.service';
import { HeroMotif } from './hero-motif';

describe('HeroMotif', () => {
  function render(role: Role, related: string[] = []): HTMLElement {
    TestBed.inject(ThemeService).setRole(role);
    const fixture = TestBed.createComponent(HeroMotif);
    fixture.componentRef.setInput('related', related);
    TestBed.tick();
    return fixture.nativeElement;
  }

  it.each([
    ['moe', '.moon'],
    ['haku', '.crt'],
    ['senpai', '.network'],
    ['guest', '.seal'],
  ] as const)('draws its own motif for %s', (role, selector) => {
    const element = render(role);

    expect(element.querySelector(selector)).not.toBeNull();
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  it('labels at most four nodes of the Senpai network', () => {
    const element = render('senpai', ['A', 'B', 'C', 'D', 'E']);

    expect([...element.querySelectorAll('.network__label')].map((el) => el.textContent)).toEqual([
      'A',
      'B',
      'C',
      'D',
    ]);
  });

  it('has no text of its own, so nothing needs translating', () => {
    for (const role of ['moe', 'haku', 'guest'] as const) {
      TestBed.resetTestingModule();
      expect(render(role).textContent?.trim()).toBe('');
    }
  });
});
