import { Role } from '../../core/services/theme.service';

/** Roles that get recommendations; the visitor sees the current season instead. */
export type RecommendedRole = Exclude<Role, 'guest'>;

/**
 * Jikan genre, theme and demographic names recommended to each role
 * (docs/DESIGN.md). They are the same lists as `ROLE_GENRES` in
 * `backend/app/core/config.py`; ids are looked up by name (see GenreService).
 */
export const ROLE_GENRES: Readonly<Record<RecommendedRole, readonly string[]>> = {
  moe: ['Shoujo', 'Mahou Shoujo', 'Romance'],
  haku: ['Shoujo', 'Isekai'],
  senpai: ['Seinen', 'Slice of Life'],
};
