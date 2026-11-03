import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Lets logged-in users through. Everybody else goes to the login page, which
 * gets the page they wanted in `returnUrl` so it can send them back.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  // Everything is injected before the first `await`: after it there is no injection context.
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.whenReady();
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
