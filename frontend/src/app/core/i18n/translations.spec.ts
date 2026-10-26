import ca from '../../../../public/i18n/ca.json';
import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import { genreKey } from './genre-key';

type Tree = Record<string, unknown>;

/** Every leaf of a translation file as a dotted key, e.g. `preview.save`. */
function keysOf(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keysOf(value as Tree, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

function valueAt(tree: Tree, dottedKey: string): unknown {
  return dottedKey.split('.').reduce<unknown>((node, part) => (node as Tree)?.[part], tree);
}

const files: Record<string, Tree> = { ca, es, en };
const englishKeys = keysOf(en).sort();

describe('translation files', () => {
  it.each(['ca', 'es'])('%s has exactly the same keys as en', (lang) => {
    const keys = keysOf(files[lang]).sort();

    expect(keys.filter((key) => !englishKeys.includes(key))).toEqual([]);
    expect(englishKeys.filter((key) => !keys.includes(key))).toEqual([]);
  });

  it.each(['ca', 'es', 'en'])('%s has no empty texts', (lang) => {
    const empty = keysOf(files[lang]).filter(
      (key) => String(valueAt(files[lang], key)).trim() === '',
    );

    expect(empty).toEqual([]);
  });

  it('translates the genres used by the roles', () => {
    for (const name of ['Shoujo', 'Mahou Shoujo', 'Romance', 'Isekai', 'Seinen', 'Slice of Life']) {
      expect(valueAt(en, genreKey(name)), name).toBeTruthy();
    }
  });

  it('translates Ecchi, which is shown with a +18 mark', () => {
    expect(valueAt(en, genreKey('Ecchi'))).toBeTruthy();
  });

  it('has no hentai or erotica, which are never shown', () => {
    for (const name of ['Hentai', 'Erotica']) {
      expect(valueAt(en, genreKey(name)), name).toBeUndefined();
    }
  });
});
