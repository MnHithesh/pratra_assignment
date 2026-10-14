import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ApiError } from './api-error';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      // A 401 on a normal request means the stored session is no longer valid.
      // Login failures are also 401s, but the login form handles those itself.
      const isAuthCall = req.url.includes('/auth/');
      if (error.status === 401 && !isAuthCall && auth.isLoggedIn()) {
        const returnUrl = router.url;
        auth.logout(false);
        snackBar.open('Your session has expired. Please log in again.', 'OK', { duration: 5000 });
        router.navigate(['/login'], { queryParams: { returnUrl } });
      }

      return throwError(() => ApiError.from(error));
    }),
  );
};
