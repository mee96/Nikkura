import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideTranslocoTesting } from '../../../testing/transloco';
import { AUTH_VIDEO_URL } from '../../core/auth/auth-media';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthLayout } from './auth-layout';

describe('AuthLayout', () => {
  let videoUrl = '';

  beforeEach(() => {
    localStorage.clear();
    videoUrl = '';
    TestBed.configureTestingModule({
      imports: [AuthLayout, provideTranslocoTesting()],
      providers: [provideRouter([]), { provide: AUTH_VIDEO_URL, useFactory: () => videoUrl }],
    });
    TestBed.inject(LanguageService).setLang('en');
  });

  afterEach(() => localStorage.clear());

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(AuthLayout);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('always uses its own look, even when a role is active', async () => {
    TestBed.inject(ThemeService).setRole('senpai');

    expect((await render()).getAttribute('data-role')).toBe('auth');
  });

  it('has the brand, a way back to exploring and the language switch, but no app navigation', async () => {
    const element = await render();

    expect(element.querySelector('a[href="/"]')?.textContent).toContain('Nikkura');
    expect(element.querySelector('a[href="/explore"]')?.textContent).toContain('Back to exploring');
    expect(element.querySelector('app-language-switch')).not.toBeNull();
    expect(element.querySelector('nav')).toBeNull();
    expect(element.querySelector('main#main')).not.toBeNull();
  });

  it('puts the pastel mesh behind the page and credits the anime data', async () => {
    const element = await render();

    expect(element.querySelector('app-mesh-background')).not.toBeNull();
    expect(element.querySelector('footer')?.textContent).toContain('Jikan');
  });

  describe('with the background video', () => {
    beforeEach(() => {
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
      videoUrl = '/clip.mp4';
    });

    afterEach(() => vi.restoreAllMocks());

    it('writes in dark over the mesh until the video plays', async () => {
      const element = await render();

      expect(element.querySelector('video')).not.toBeNull();
      expect(element.classList).not.toContain('auth--video');
      expect(element.querySelector('.auth-scrim')).toBeNull();
    });

    it('switches to light text over a dark layer once the video plays, and back if it fails', async () => {
      const fixture = TestBed.createComponent(AuthLayout);
      await fixture.whenStable();
      const element: HTMLElement = fixture.nativeElement;
      const clip = element.querySelector('video')!;

      clip.dispatchEvent(new Event('playing'));
      await fixture.whenStable();
      expect(element.classList).toContain('auth--video');
      expect(element.querySelector('.auth-scrim')?.getAttribute('aria-hidden')).toBe('true');

      clip.dispatchEvent(new Event('error'));
      await fixture.whenStable();
      expect(element.classList).not.toContain('auth--video');
      expect(element.querySelector('.auth-scrim')).toBeNull();
    });
  });
});
