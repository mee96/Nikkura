import { makeAnime, tag } from '../../../testing/anime';
import { Anime } from '../models/jikan.model';
import { EXCLUDED_GENRES, MATURE_GENRES, isAllowedAnime, isMatureAnime } from './content-rules';

describe('content rules', () => {
  it('never shows hentai, and marks ecchi and erotica as +18', () => {
    expect([...EXCLUDED_GENRES]).toEqual(['Hentai']);
    expect([...MATURE_GENRES]).toEqual(['Ecchi', 'Erotica']);
  });

  it('allows ordinary anime, R-rated included', () => {
    expect(isAllowedAnime(makeAnime())).toBe(true);
    expect(isAllowedAnime(makeAnime({ rating: 'R - 17+ (violence & profanity)' }))).toBe(true);
    expect(isAllowedAnime(makeAnime({ rating: null }))).toBe(true);
  });

  it('hides anime rated Rx, whatever its genres say', () => {
    expect(isAllowedAnime(makeAnime({ rating: 'Rx - Hentai' }))).toBe(false);
  });

  it('hides anime with Hentai among its explicit genres', () => {
    expect(isAllowedAnime(makeAnime({ explicit_genres: [tag('Hentai')] }))).toBe(false);
  });

  it.each([
    ['Ecchi', 9],
    ['Erotica', 49],
  ])('shows %s, with the +18 mark', (name, id) => {
    const anime = makeAnime({ explicit_genres: [tag(name, id)] });

    expect(isAllowedAnime(anime)).toBe(true);
    expect(isMatureAnime(anime)).toBe(true);
    expect(isMatureAnime(makeAnime({ genres: [tag(name.toLowerCase())] }))).toBe(true);
  });

  it('hides erotica when it is rated Rx, because that is hentai', () => {
    const anime = makeAnime({ rating: 'Rx - Hentai', explicit_genres: [tag('Erotica', 49)] });

    expect(isAllowedAnime(anime)).toBe(false);
  });

  it('does not mark ordinary anime', () => {
    expect(isMatureAnime(makeAnime())).toBe(false);
  });

  it.each(['Hentai', 'hentai', 'HENTAI', '  Hentai  '])(
    'hides anime tagged %s in any list',
    (name) => {
      expect(isAllowedAnime(makeAnime({ genres: [tag('Comedy'), tag(name)] }))).toBe(false);
      expect(isAllowedAnime(makeAnime({ themes: [tag(name)] }))).toBe(false);
    },
  );

  it('copes with lists missing from a partial response', () => {
    const partial = { ...makeAnime(), explicit_genres: undefined } as unknown as Anime;

    expect(isAllowedAnime(partial)).toBe(true);
  });
});
