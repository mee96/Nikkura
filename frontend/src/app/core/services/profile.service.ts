import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ApiUserProfile,
  AccountRole,
  UserProfile,
  fromApiRole,
  toApiRole,
} from '../models/profile.model';

/** The profile of the logged-in user, kept by the Nikkura backend (`/users/me`). */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl.replace(/\/+$/, '')}/users/me`;

  /**
   * Creates the profile right after signing up. Calling it again is safe: the
   * backend returns the profile that already exists, unchanged, so the role
   * that comes back is the one that counts (it can differ from `role`).
   */
  async create(username: string, role: AccountRole): Promise<UserProfile> {
    const profile = await firstValueFrom(
      this.http.post<ApiUserProfile>(this.url, { username, role: toApiRole(role) }),
    );
    const known = fromApiRole(profile.role);
    if (!known) {
      throw new Error(`Unknown role from the backend: ${profile.role}`);
    }
    return { uid: profile.uid, username: profile.username, email: profile.email, role: known };
  }
}
