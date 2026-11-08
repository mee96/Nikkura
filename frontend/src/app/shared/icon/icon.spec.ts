import { TestBed } from '@angular/core/testing';

import { Icon } from './icon';

describe('Icon', () => {
  it('draws the paths of the icon and hides it from screen readers', async () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', 'search');
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelectorAll('path').length).toBe(2);
  });
});
