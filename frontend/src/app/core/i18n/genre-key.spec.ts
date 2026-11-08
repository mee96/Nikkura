import { genreKey } from './genre-key';

describe('genreKey', () => {
  it.each([
    ['Shoujo', 'genres.shoujo'],
    ['Slice of Life', 'genres.slice-of-life'],
    ['Sci-Fi', 'genres.sci-fi'],
    ['Idols (Female)', 'genres.idols-female'],
    ['  Mahou   Shoujo ', 'genres.mahou-shoujo'],
  ])('turns "%s" into %s', (name, key) => {
    expect(genreKey(name)).toBe(key);
  });
});
