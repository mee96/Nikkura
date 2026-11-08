import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ThemeService } from '../../core/services/theme.service';
import { Icon } from '../../shared/icon/icon';
import { LanguageSwitch } from '../../shared/language-switch/language-switch';
import { SearchBar } from '../../shared/search-bar/search-bar';
import { NAV_ITEMS } from '../nav-items';

/**
 * The frame shared by every screen of the app:
 * - desktop: full sidebar, top bar with search, content and a side column (`aside` outlet)
 * - tablet: the sidebar collapses to an icon rail, no side column
 * - mobile: header with search and a bottom navigation with four tabs
 */
@Component({
  selector: 'app-shell',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslocoPipe,
    Icon,
    LanguageSwitch,
    SearchBar,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly theme = inject(ThemeService);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected readonly navItems = NAV_ITEMS;
  protected readonly bottomNavItems = NAV_ITEMS.filter((item) => item.inBottomNav);

  protected readonly role = this.theme.role;
  protected readonly isGuest = computed(() => this.role() === 'guest');

  /** True while the current page fills the side column. */
  protected readonly hasAside = signal(false);

  /** Moves focus to the content without changing the URL (a `#main` link would reload the route). */
  protected skipToContent(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
