import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { ThemeService } from '../../../core/services/theme.service';

/**
 * Decoration on the right of the home banner, one per role: a moon with
 * sparkles (Moe Magical), a CRT television (Haku Sama), a network of nodes
 * (Senpai) and a quiet pair of circles for visitors.
 *
 * It is purely decorative (`aria-hidden`), uses only tokens, and its only motion
 * is one short animation when it appears. Reduced motion shortens it to nothing.
 */
@Component({
  selector: 'app-hero-motif',
  template: `
    @switch (role()) {
      @case ('moe') {
        <div class="moon">
          <span class="moon__disc"></span>
          <span class="moon__cut"></span>
          <svg class="spark spark--big" viewBox="0 0 24 24"><path [attr.d]="sparkle" /></svg>
          <svg class="spark spark--mid" viewBox="0 0 24 24"><path [attr.d]="sparkle" /></svg>
          <svg class="spark spark--small" viewBox="0 0 24 24"><path [attr.d]="sparkle" /></svg>
        </div>
      }
      @case ('haku') {
        <div class="crt">
          <div class="crt__screen">
            <span class="crt__planet"></span>
            <span class="crt__ring"></span>
            <span class="crt__scanlines"></span>
            <span class="crt__tracking"></span>
          </div>
          <div class="crt__knobs"><span></span><span></span></div>
        </div>
      }
      @case ('senpai') {
        <div class="network">
          <svg class="network__lines" viewBox="0 0 330 264">
            <path d="M60 50V118H165M270 60V118H165M250 200V132H165M70 190V132H165" />
            <circle class="network__ring network__ring--outer" cx="165" cy="125" r="40" />
            <circle class="network__ring network__ring--inner" cx="165" cy="125" r="28" />
            <circle class="network__pulse" cx="165" cy="125" r="20" />
            <circle class="network__node network__node--center" cx="165" cy="125" r="20" />
            <circle class="network__node" cx="60" cy="50" r="12" />
            <circle class="network__node" cx="270" cy="60" r="12" />
            <circle class="network__node" cx="250" cy="200" r="12" />
            <circle class="network__node" cx="70" cy="190" r="12" />
          </svg>
          @for (title of labels(); track $index) {
            <span class="network__label network__label--{{ $index }}">{{ title }}</span>
          }
        </div>
      }
      @default {
        <div class="seal">
          <span class="seal__outer"></span>
          <span class="seal__inner"></span>
        </div>
      }
    }
  `,
  styleUrl: './hero-motif.scss',
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroMotif {
  private readonly theme = inject(ThemeService);

  /** Titles shown next to the nodes of the Senpai network (the other picks of the shelf). */
  readonly related = input<readonly string[]>([]);

  protected readonly role = this.theme.role;
  protected readonly labels = computed(() => this.related().slice(0, 4));

  /** Four-point star, used for the Moe Magical sparkles. */
  protected readonly sparkle =
    'M12 0C12.6 6.6 17.4 11.4 24 12C17.4 12.6 12.6 17.4 12 24C11.4 17.4 6.6 12.6 0 12C6.6 11.4 11.4 6.6 12 0Z';
}
