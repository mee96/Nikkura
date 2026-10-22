import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Role, ThemeService } from '../../core/services/theme.service';

/**
 * Temporary page to check the design tokens of the four themes.
 * It will be replaced by the real home when the layout (#10) is built.
 */
@Component({
  selector: 'app-theme-preview',
  templateUrl: './theme-preview.html',
  styleUrl: './theme-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePreview {
  protected readonly theme = inject(ThemeService);

  protected readonly roles: { id: Role; name: string }[] = [
    { id: 'moe', name: 'Moe Magical' },
    { id: 'haku', name: 'Haku Sama' },
    { id: 'senpai', name: 'Senpai' },
    { id: 'guest', name: 'Visitor' },
  ];

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
