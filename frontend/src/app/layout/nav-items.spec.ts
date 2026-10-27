import en from '../../../public/i18n/en.json';
import { NAV_ITEMS } from './nav-items';

function hasKey(key: string): boolean {
  return (
    key
      .split('.')
      .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], en) !== undefined
  );
}

describe('NAV_ITEMS', () => {
  it('has the five sections of the design, in order', () => {
    expect(NAV_ITEMS.map((item) => item.path)).toEqual([
      '/',
      '/explore',
      '/season',
      '/kura',
      '/settings',
    ]);
  });

  it('keeps four tabs for the mobile navigation (settings opens from the header)', () => {
    expect(NAV_ITEMS.filter((item) => item.inBottomNav)).toHaveLength(4);
  });

  it('only the home needs an exact match', () => {
    expect(NAV_ITEMS.filter((item) => item.exact).map((item) => item.path)).toEqual(['/']);
  });

  it('uses translation keys that exist', () => {
    const keys = NAV_ITEMS.flatMap((item) => [item.label, item.shortLabel ?? item.label]);

    expect(keys.filter((key) => !hasKey(key))).toEqual([]);
  });
});
