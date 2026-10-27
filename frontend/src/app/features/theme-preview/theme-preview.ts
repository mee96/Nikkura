import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { genreKey } from '../../core/i18n/genre-key';
import { ROLES, ThemeService } from '../../core/services/theme.service';

/**
 * Page to check the design tokens of the four themes, at `/design`.
 * Not in the navigation; it goes away once the real screens cover every token.
 */
@Component({
  selector: 'app-theme-preview',
  imports: [TranslocoPipe],
  templateUrl: './theme-preview.html',
  styleUrl: './theme-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePreview {
  protected readonly theme = inject(ThemeService);

  protected readonly roles = ROLES;

  /** Names as Jikan returns them, translated through the genres table. */
  protected readonly sampleGenres = ['Shoujo', 'Romance', 'Slice of Life', 'Fantasy'];

  protected readonly genreKey = genreKey;

  protected readonly colours = [
    'bg',
    'sidebar',
    'surface',
    'soft',
    'border',
    'border-strong',
    'text',
    'muted',
    'primary',
    'on-primary',
    'primary-text',
    'hero',
    'on-hero',
    'hero-motif',
    'hero-button',
    'on-hero-button',
    'focus',
  ];

  protected readonly covers = [1, 2, 3, 4, 5];

  protected readonly typeScale = ['3xl', '2xl', 'xl', 'lg', 'md', 'base', 'sm', 'xs'];

  protected readonly spaces = [1, 2, 3, 4, 6, 8, 12];

  protected readonly radii = ['sm', 'md', 'lg', 'pill'];

  protected readonly shadows = ['sm', 'md', 'lg'];
}
