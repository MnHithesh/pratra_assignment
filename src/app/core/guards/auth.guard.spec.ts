import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const loggedIn = signal(false);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isLoggedIn: loggedIn } }],
    });
  });

  const run = (url: string) =>
    TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot));

  it('lets logged-in users through', () => {
    loggedIn.set(true);
    expect(run('/book/1')).toBeTrue();
  });

  it('sends guests to login with a return url', () => {
    loggedIn.set(false);
    const result = run('/book/1?date=2030-05-10') as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fbook%2F1%3Fdate%3D2030-05-10');
  });
});
