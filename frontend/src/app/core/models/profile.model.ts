import { Role } from '../services/theme.service';

/** A role an account can have (`guest` is the look for people without an account). */
export type AccountRole = Exclude<Role, 'guest'>;

/** The role names the backend uses (`Role` in `backend/app/core/config.py`). */
export type ApiRole = 'moe_magical' | 'haku_sama' | 'senpai';

/** What `GET` and `POST /users/me` answer. */
export interface ApiUserProfile {
  uid: string;
  username: string;
  email: string | null;
  role: string;
  created_at: string;
}

/** The profile of the logged-in user, with the role in the names the app uses. */
export interface UserProfile {
  uid: string;
  username: string;
  email: string | null;
  role: AccountRole;
}

const API_ROLES: Readonly<Record<AccountRole, ApiRole>> = {
  moe: 'moe_magical',
  haku: 'haku_sama',
  senpai: 'senpai',
};

export function toApiRole(role: AccountRole): ApiRole {
  return API_ROLES[role];
}

/** The app role for a backend role name, or `null` when the backend sends one we do not know. */
export function fromApiRole(role: string): AccountRole | null {
  const found = Object.entries(API_ROLES).find(([, apiRole]) => apiRole === role);
  return found ? (found[0] as AccountRole) : null;
}
