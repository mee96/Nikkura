import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Soft pastel background for login and sign-up: five blurred colour spots (pink and
 * lilac from Moe Magical, blue from Haku Sama, peach from Senpai, and mint) that drift
 * slowly into each other. It is decoration only: hidden from screen readers, behind the
 * page, and it never takes clicks. The colours and speeds are the `--mesh-*` tokens.
 */
@Component({
  selector: 'app-mesh-background',
  template: `
    <span class="blob blob--moe"></span>
    <span class="blob blob--lilac"></span>
    <span class="blob blob--haku"></span>
    <span class="blob blob--senpai"></span>
    <span class="blob blob--mint"></span>
  `,
  styleUrl: './mesh-background.scss',
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeshBackground {}
