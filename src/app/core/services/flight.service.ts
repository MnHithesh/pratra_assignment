import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../http/api-base-url';
import { retryTransient } from '../http/retry-transient';
import { Flight, FlightSchedule } from '../models/flight.model';
import { FlightSearchCriteria } from '../models/flight-search.model';
import { toFlight } from '../utils/flight.util';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  search(criteria: FlightSearchCriteria): Observable<Flight[]> {
    const params = new HttpParams().set('from', criteria.from).set('to', criteria.to);

    return this.http.get<FlightSchedule[]>(`${this.apiUrl}/flights`, { params }).pipe(
      retryTransient(),
      map(schedules => schedules.map(schedule => toFlight(schedule, criteria.departDate))),
      // No point showing flights that have already left if someone searches for today.
      map(flights => flights.filter(flight => flight.departureTime.getTime() > Date.now())),
    );
  }

  getFlight(id: string, travelDate: string): Observable<Flight> {
    return this.http
      .get<FlightSchedule>(`${this.apiUrl}/flights/${encodeURIComponent(id)}`)
      .pipe(retryTransient(), map(schedule => toFlight(schedule, travelDate)));
  }
}
