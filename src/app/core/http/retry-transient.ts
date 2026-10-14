import { MonoTypeOperatorFunction, retry, throwError, timer } from 'rxjs';

import { ApiError } from './api-error';

/**
 * Retries a request once after a short pause, but only for errors that might go
 * away on their own (network blips, 5xx). A 404 or 400 will not change on retry.
 */
export function retryTransient<T>(count = 1, delayMs = 800): MonoTypeOperatorFunction<T> {
  return retry({
    count,
    delay: error => {
      const transient = error instanceof ApiError && (error.status === 0 || error.status >= 500);
      return transient ? timer(delayMs) : throwError(() => error);
    },
  });
}
