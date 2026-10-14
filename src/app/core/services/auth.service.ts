import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../http/api-base-url';
import { AuthSession, LoginRequest, SignupRequest, User } from '../models/user.model';

const STORAGE_KEY = 'skyfinder.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_BASE_URL);

  private readonly session = signal<AuthSession | null>(restoreSession());

  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  login(credentials: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<AuthSession>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(tap(session => this.saveSession(session)));
  }

  signup(details: SignupRequest): Observable<AuthSession> {
    return this.http
      .post<AuthSession>(`${this.apiUrl}/auth/signup`, details)
      .pipe(tap(session => this.saveSession(session)));
  }

  logout(redirectHome = true): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage can be unavailable (private mode etc.), nothing to clean up then
    }
    if (redirectHome) {
      this.router.navigateByUrl('/');
    }
  }

  private saveSession(session: AuthSession): void {
    this.session.set(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // still logged in for this tab, just won't survive a reload
    }
  }
}

function restoreSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSession;
    return isTokenExpired(session.token) ? null : session;
  } catch {
    return null;
  }
}

/** The mock API token is base64url encoded JSON with an `exp` timestamp. */
function isTokenExpired(token: string): boolean {
  try {
    const json = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };
    return !exp || exp < Date.now();
  } catch {
    return true;
  }
}
