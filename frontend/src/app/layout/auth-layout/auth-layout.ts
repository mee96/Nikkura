import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { AUTH_VIDEO_URL } from '../../core/auth/auth-media';
import { LanguageMenu } from '../../shared/language-menu/language-menu';
import { MeshBackground } from '../../shared/mesh-background/mesh-background';
import { VideoBackground } from '../../shared/video-background/video-background';

/**
 * Frame for login and sign-up: no app navigation, only the brand and the language menu. The person has no role yet, so the frame has
 * its own look (`data-role="auth"`), whatever role was active before.
 *
 * Behind everything there is the slow pastel mesh of the three roles, and over it a
 * silent looping video. While the video plays, a dark layer keeps the light text
 * readable (`auth--video`); without the video (loading, blocked, or reduced motion)
 * the mesh stays and the text is dark.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, LanguageMenu, MeshBackground, VideoBackground],
  host: { 'data-role': 'auth', '[class.auth--video]': 'videoOn()' },
  template: `
    <app-mesh-background />
    <app-video-background [src]="videoUrl" (playingChange)="videoOn.set($event)" />
    @if (videoOn()) {
      <div class="auth-scrim" aria-hidden="true"></div>
    }
    <header class="auth-header">
      <a class="auth-header__brand" routerLink="/">
        <svg class="auth-header__mark" viewBox="0 0 40 40" aria-hidden="true">
          <rect class="auth-header__cover" x="7" y="3" width="26" height="34" rx="6" />
          <rect class="auth-header__spine" x="7" y="3" width="8" height="34" rx="4" />
          <path class="auth-header__ribbon" d="M25 3v15l3.5-3 3.5 3V3z" />
          <circle class="auth-header__petal" cx="23" cy="27" r="3.2" />
        </svg>
        Nikkura
      </a>
      <app-language-menu />
    </header>
    <main id="main" class="auth-main">
      <router-outlet />
    </main>
  `,
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  protected readonly videoUrl = inject(AUTH_VIDEO_URL);
  /** True while the background video is playing. */
  protected readonly videoOn = signal(false);
}
