import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AUTH_VIDEO_URL } from '../../core/auth/auth-media';
import { Icon } from '../../shared/icon/icon';
import { LanguageSwitch } from '../../shared/language-switch/language-switch';
import { MeshBackground } from '../../shared/mesh-background/mesh-background';
import { VideoBackground } from '../../shared/video-background/video-background';

/**
 * Frame for login and sign-up: no app navigation, only the brand, the language
 * switch and a way back to exploring. The person has no role yet, so the frame has
 * its own look (`data-role="auth"`), whatever role was active before.
 *
 * Behind everything there is the slow pastel mesh of the three roles, and over it a
 * silent looping video. While the video plays, a dark layer keeps the light text
 * readable (`auth--video`); without the video (loading, blocked, or reduced motion)
 * the mesh stays and the text is dark.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    TranslocoPipe,
    Icon,
    LanguageSwitch,
    MeshBackground,
    VideoBackground,
  ],
  host: { 'data-role': 'auth', '[class.auth--video]': 'videoOn()' },
  template: `
    <app-mesh-background />
    <app-video-background [src]="videoUrl" (playingChange)="videoOn.set($event)" />
    @if (videoOn()) {
      <div class="auth-scrim" aria-hidden="true"></div>
    }
    <header class="auth-header">
      <a class="auth-header__brand" routerLink="/">
        <svg class="auth-header__mark" viewBox="0 0 40 28" aria-hidden="true">
          <circle class="auth-header__dot auth-header__dot--moe" cx="12" cy="14" r="11" />
          <circle class="auth-header__dot auth-header__dot--haku" cx="20" cy="14" r="11" />
          <circle class="auth-header__dot auth-header__dot--senpai" cx="28" cy="14" r="11" />
        </svg>
        Nikkura
      </a>
      <app-language-switch class="auth-header__language" />
      <a
        class="auth-header__back"
        routerLink="/explore"
        [attr.aria-label]="'shell.backToExplore' | transloco"
      >
        <span class="auth-header__back-label">{{ 'shell.backToExplore' | transloco }}</span>
        <span class="auth-header__back-icon"><app-icon name="arrowRight" /></span>
      </a>
    </header>
    <main id="main" class="auth-main">
      <router-outlet />
    </main>
    <footer class="auth-footer">{{ 'shell.dataCredit' | transloco }}</footer>
  `,
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  protected readonly videoUrl = inject(AUTH_VIDEO_URL);
  /** True while the background video is playing. */
  protected readonly videoOn = signal(false);
}
