import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Sends guests to the login page and remembers where they were heading. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(AuthService).isLoggedIn()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Keeps logged-in users away from the login and signup pages. */
export const guestGuard: CanActivateFn = () => {
  return inject(AuthService).isLoggedIn() ? inject(Router).createUrlTree(['/']) : true;
};
