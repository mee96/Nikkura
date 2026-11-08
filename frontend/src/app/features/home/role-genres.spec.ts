import { ROLES } from '../../core/services/theme.service';
import { ROLE_GENRES } from './role-genres';

describe('ROLE_GENRES', () => {
  it('has the genres of docs/DESIGN.md for each role', () => {
    expect(ROLE_GENRES.moe).toEqual(['Shoujo', 'Mahou Shoujo', 'Romance']);
    expect(ROLE_GENRES.haku).toEqual(['Shoujo', 'Isekai']);
    expect(ROLE_GENRES.senpai).toEqual(['Seinen', 'Slice of Life']);
  });

  it('covers every role except the visitor, who gets the current season', () => {
    expect(Object.keys(ROLE_GENRES).sort()).toEqual(ROLES.filter((r) => r !== 'guest').sort());
  });
});
