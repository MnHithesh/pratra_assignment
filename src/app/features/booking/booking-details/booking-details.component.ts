import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { ApiError } from '../../../core/http/api-error';
import { Booking } from '../../../core/models/booking.model';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { AirlineLogoComponent } from '../../../shared/components/airline-logo/airline-logo.component';
import { FlightTimelineComponent } from '../../../shared/components/flight-timeline/flight-timeline.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { MessagePanelComponent } from '../../../shared/components/message-panel/message-panel.component';
import { BookingSuccessComponent } from '../booking-success/booking-success.component';

type PageState =
  | { status: 'loading' }
  | { status: 'loaded'; booking: Booking }
  | { status: 'error'; error: ApiError };

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    AirlineLogoComponent,
    BookingSuccessComponent,
    FlightTimelineComponent,
    LoadingStateComponent,
    MessagePanelComponent,
  ],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(BookingService);
  protected readonly user = inject(AuthService).user;

  private readonly navigationState = inject(Router).getCurrentNavigation()?.extras.state;

  /** True only straight after booking. A refresh or a visit from "My bookings" skips the animation. */
  protected readonly justBooked = !!this.navigationState?.['justBooked'];

  /** The booking form passes the created booking along, so we don't need to fetch it again. */
  private readonly passedBooking = this.navigationState?.['booking'] as Booking | undefined;

  protected readonly state$ = this.route.paramMap.pipe(
    map(params => params.get('id') ?? ''),
    switchMap(id =>
      (this.passedBooking?.id === id ? of(this.passedBooking) : this.bookingService.getBooking(id)).pipe(
        map(booking => ({ status: 'loaded', booking }) as PageState),
        catchError((error: ApiError) => of<PageState>({ status: 'error', error })),
        startWith<PageState>({ status: 'loading' }),
      ),
    ),
  );

  protected firstName(): string {
    return this.user()?.name.split(' ')[0] ?? '';
  }

  protected print(): void {
    window.print();
  }
}
