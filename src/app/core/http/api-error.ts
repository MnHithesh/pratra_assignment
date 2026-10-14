import { HttpErrorResponse } from '@angular/common/http';

/** The single error shape components deal with, whatever went wrong underneath. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  static from(error: HttpErrorResponse): ApiError {
    return new ApiError(error.status, friendlyMessage(error));
  }
}

function friendlyMessage(error: HttpErrorResponse): string {
  const serverMessage = typeof error.error?.message === 'string' ? error.error.message : null;

  if (error.status === 0) {
    return "We couldn't reach the server. Check your connection, or make sure the mock API is running (npm start).";
  }
  if (error.status >= 500) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }
  return serverMessage ?? (error.status === 404 ? "We couldn't find what you were looking for." : 'The request could not be completed.');
}
