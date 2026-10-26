import { makeAnime, tag } from '../../../testing/anime';
import { Anime } from '../models/jikan.model';
import { EXCLUDED_GENRES, isAllowedAnime } from './content-rules';

describe('content rules', () => {
  it('never shows the explicit genres', () => {
    expect([...EXCLUDED_GENRES]).toEqual(['Hentai', 'Erotica', 'Ecchi']);
  });

  it('allows ordinary anime, R-rated included', () => {
    expect(isAllowedAnime(makeAnime())).toBe(true);
    expect(isAllowedAnime(makeAnime({ rating: 'R - 17+ (violence & profanity)' }))).toBe(true);
    expect(isAllowedAnime(makeAnime({ rating: null }))).toBe(true);
  });

  it('hides anime rated Rx, whatever its genres say', () => {
    expect(isAllowedAnime(makeAnime({ rating: 'Rx - Hentai' }))).toBe(false);
  });

  it('hides anime Jikan marks with an explicit genre', () => {
    expect(isAllowedAnime(makeAnime({ explicit_genres: [tag('Ecchi', 9)] }))).toBe(false);
  });

  it.each(['Hentai', 'erotica', 'ECCHI'])('hides anime tagged %s in any list', (name) => {
    expect(isAllowedAnime(makeAnime({ genres: [tag('Comedy'), tag(name)] }))).toBe(false);
    expect(isAllowedAnime(makeAnime({ themes: [tag(name)] }))).toBe(false);
  });

  it('copes with lists missing from a partial response', () => {
    const partial = { ...makeAnime(), explicit_genres: undefined } as unknown as Anime;

    expect(isAllowedAnime(partial)).toBe(true);
  });
});
