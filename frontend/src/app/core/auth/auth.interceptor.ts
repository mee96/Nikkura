import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/** True only for the Nikkura backend: the token must never reach Jikan or any other host. */
function isBackendUrl(url: string): boolean {
  const base = environment.apiUrl.replace(/\/+$/, '');
  return url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`);
}

/** Adds `Authorization: Bearer <ID token>` to the calls to the backend while someone is logged in. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isBackendUrl(request.url)) {
    return next(request);
  }
  return from(inject(AuthService).idToken()).pipe(
    switchMap((token) =>
      next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request),
    ),
  );
};
