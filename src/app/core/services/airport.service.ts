import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

import { API_BASE_URL } from '../http/api-base-url';
import { retryTransient } from '../http/retry-transient';
import { Airport } from '../models/airport.model';

@Injectable({ providedIn: 'root' })
export class AirportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  // The airport list is small and never changes, so fetch it once and share it.
  readonly airports$: Observable<Airport[]> = this.http
    .get<Airport[]>(`${this.apiUrl}/airports`)
    .pipe(retryTransient(), shareReplay({ bufferSize: 1, refCount: false }));

  readonly byCode$: Observable<Map<string, Airport>> = this.airports$.pipe(
    map(airports => new Map(airports.map(airport => [airport.code, airport]))),
  );
}
