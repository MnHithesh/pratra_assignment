import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../http/api-base-url';
import { retryTransient } from '../http/retry-transient';
import { Booking, NewBooking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  create(booking: NewBooking): Observable<Booking> {
    // Not retried on purpose: retrying a POST could create the booking twice.
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, booking);
  }

  /** Bookings of the logged-in user, newest first. The API scopes them by token. */
  getMyBookings(): Observable<Booking[]> {
    const params = new HttpParams().set('_sort', 'createdAt').set('_order', 'desc');
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`, { params }).pipe(retryTransient());
  }

  getBooking(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${encodeURIComponent(id)}`).pipe(retryTransient());
  }
}
