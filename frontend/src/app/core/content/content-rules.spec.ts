import { makeAnime, tag } from '../../../testing/anime';
import { Anime } from '../models/jikan.model';
import { EXCLUDED_GENRES, MATURE_GENRES, isAllowedAnime, isMatureAnime } from './content-rules';

describe('content rules', () => {
  it('never shows hentai or erotica, and marks ecchi as +18', () => {
    expect([...EXCLUDED_GENRES]).toEqual(['Hentai', 'Erotica']);
    expect([...MATURE_GENRES]).toEqual(['Ecchi']);
  });

  it('allows ordinary anime, R-rated included', () => {
    expect(isAllowedAnime(makeAnime())).toBe(true);
    expect(isAllowedAnime(makeAnime({ rating: 'R - 17+ (violence & profanity)' }))).toBe(true);
    expect(isAllowedAnime(makeAnime({ rating: null }))).toBe(true);
  });

  it('hides anime rated Rx, whatever its genres say', () => {
    expect(isAllowedAnime(makeAnime({ rating: 'Rx - Hentai' }))).toBe(false);
  });

  it.each(['Hentai', 'Erotica'])('hides anime with %s among its explicit genres', (name) => {
    expect(isAllowedAnime(makeAnime({ explicit_genres: [tag(name)] }))).toBe(false);
  });

  it('shows ecchi, with the +18 mark', () => {
    const ecchi = makeAnime({ explicit_genres: [tag('Ecchi', 9)] });

    expect(isAllowedAnime(ecchi)).toBe(true);
    expect(isMatureAnime(ecchi)).toBe(true);
    expect(isMatureAnime(makeAnime({ genres: [tag('ecchi')] }))).toBe(true);
  });

  it('does not mark ordinary anime', () => {
    expect(isMatureAnime(makeAnime())).toBe(false);
  });

  it.each(['Hentai', 'erotica', 'HENTAI'])('hides anime tagged %s in any list', (name) => {
    expect(isAllowedAnime(makeAnime({ genres: [tag('Comedy'), tag(name)] }))).toBe(false);
    expect(isAllowedAnime(makeAnime({ themes: [tag(name)] }))).toBe(false);
  });

  it('copes with lists missing from a partial response', () => {
    const partial = { ...makeAnime(), explicit_genres: undefined } as unknown as Anime;

    expect(isAllowedAnime(partial)).toBe(true);
  });
});
