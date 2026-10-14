import { AsyncPipe, CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, map, of, startWith, Subject, switchMap } from 'rxjs';

import { ApiError } from '../../../core/http/api-error';
import { Booking } from '../../../core/models/booking.model';
import { BookingService } from '../../../core/services/booking.service';
import { AirlineLogoComponent } from '../../../shared/components/airline-logo/airline-logo.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { MessagePanelComponent } from '../../../shared/components/message-panel/message-panel.component';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { StopsPipe } from '../../../shared/pipes/stops.pipe';

type PageState =
  | { status: 'loading' }
  | { status: 'loaded'; upcoming: Booking[]; past: Booking[] }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    NgTemplateOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    AirlineLogoComponent,
    LoadingStateComponent,
    MessagePanelComponent,
    DurationPipe,
    StopsPipe,
  ],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyBookingsComponent {
  private readonly bookingService = inject(BookingService);
  private readonly reload$ = new Subject<void>();

  protected readonly state$ = this.reload$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.bookingService.getMyBookings().pipe(
        map(bookings => splitByDate(bookings)),
        map(({ upcoming, past }) => ({ status: 'loaded', upcoming, past }) as PageState),
        catchError((error: ApiError) => of<PageState>({ status: 'error', message: error.message })),
        startWith<PageState>({ status: 'loading' }),
      ),
    ),
  );

  protected reload(): void {
    this.reload$.next();
  }
}

function splitByDate(bookings: Booking[]): { upcoming: Booking[]; past: Booking[] } {
  const now = Date.now();
  const departs = (b: Booking) => new Date(b.flight.departureTime).getTime();

  return {
    // soonest trip first
    upcoming: bookings.filter(b => departs(b) >= now).sort((a, b) => departs(a) - departs(b)),
    past: bookings.filter(b => departs(b) < now).sort((a, b) => departs(b) - departs(a)),
  };
}
