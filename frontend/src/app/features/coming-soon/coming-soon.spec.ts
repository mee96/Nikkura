import { TestBed } from '@angular/core/testing';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { LanguageService } from '../../core/services/language.service';
import { ComingSoon } from './coming-soon';

describe('ComingSoon', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [ComingSoon, provideTranslocoTesting()] });
  });

  afterEach(() => localStorage.clear());

  it('shows the translated title it gets from the route, with the coming-soon note', async () => {
    TestBed.inject(LanguageService).setLang('ca');
    const fixture = TestBed.createComponent(ComingSoon);
    fixture.componentRef.setInput('titleKey', 'nav.season');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Temporada');
    expect(element.querySelector('.coming-soon__badge')?.textContent).toContain('Aviat');
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe('page-title');
  });
});
