import { TestBed } from '@angular/core/testing';

import { MeshBackground } from './mesh-background';

describe('MeshBackground', () => {
  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(MeshBackground);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('is decoration only: hidden from screen readers and without any text or control', async () => {
    const element = await render();

    expect(element.getAttribute('aria-hidden')).toBe('true');
    expect(element.textContent?.trim()).toBe('');
    expect(element.querySelector('a, button, input')).toBeNull();
  });

  it('has the five colour spots of the mesh', async () => {
    const element = await render();

    expect(
      [...element.querySelectorAll('.blob')].map((blob) =>
        [...blob.classList].find((name) => name.startsWith('blob--')),
      ),
    ).toEqual(['blob--moe', 'blob--lilac', 'blob--haku', 'blob--senpai', 'blob--mint']);
  });
});
