import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { catchError, combineLatest, finalize, map, Observable, of, startWith, switchMap, tap } from 'rxjs';

import { ApiError } from '../../../core/http/api-error';
import { NewBooking, PassengerTitle } from '../../../core/models/booking.model';
import { Flight } from '../../../core/models/flight.model';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { FlightService } from '../../../core/services/flight.service';
import { parseIsoDate, startOfToday, toIsoDate } from '../../../core/utils/date.util';
import { calculateFare } from '../../../core/utils/flight.util';
import { AirlineLogoComponent } from '../../../shared/components/airline-logo/airline-logo.component';
import { FlightTimelineComponent } from '../../../shared/components/flight-timeline/flight-timeline.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { MessagePanelComponent } from '../../../shared/components/message-panel/message-panel.component';

type PageState =
  | { status: 'loading' }
  | { status: 'loaded'; flight: Flight; passengers: number }
  | { status: 'error'; error: ApiError };

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    AirlineLogoComponent,
    FlightTimelineComponent,
    LoadingStateComponent,
    MessagePanelComponent,
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly flightService = inject(FlightService);
  private readonly bookingService = inject(BookingService);
  private readonly auth = inject(AuthService);

  protected readonly titles: PassengerTitle[] = ['Mr', 'Ms', 'Mrs'];
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    contact: this.fb.nonNullable.group({
      email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    }),
    passengers: this.fb.array<FormGroup>([]),
  });

  protected readonly state$: Observable<PageState> = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
    switchMap(([params, query]) => {
      const date = toIsoDate(parseIsoDate(query.get('date')) ?? startOfToday());
      const pax = Number(query.get('pax'));
      const passengers = Number.isInteger(pax) && pax >= 1 && pax <= 9 ? pax : 1;

      return this.flightService.getFlight(params.get('flightId') ?? '', date).pipe(
        tap(() => this.setPassengerCount(passengers)),
        map(flight => ({ status: 'loaded', flight, passengers }) as PageState),
        catchError((error: ApiError) => of<PageState>({ status: 'error', error })),
        startWith<PageState>({ status: 'loading' }),
      );
    }),
  );

  get passengers(): FormArray<FormGroup> {
    return this.form.controls.passengers;
  }

  protected fareFor(flight: Flight, passengers: number) {
    return calculateFare(flight.price, passengers, flight.currency);
  }

  protected submit(flight: Flight): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { contact, passengers } = this.form.getRawValue();
    const booking: NewBooking = {
      flightId: flight.id,
      travelDate: flight.travelDate,
      flight: {
        airline: flight.airline,
        airlineCode: flight.airlineCode,
        flightNumber: flight.flightNumber,
        from: flight.from,
        to: flight.to,
        departureTime: flight.departureTime.toISOString(),
        arrivalTime: flight.arrivalTime.toISOString(),
        durationMinutes: flight.durationMinutes,
        stops: flight.stops,
      },
      passengers: passengers.map(p => ({
        title: p['title'],
        firstName: p['firstName'].trim(),
        lastName: p['lastName'].trim(),
        age: Number(p['age']),
      })),
      contact,
      fare: calculateFare(flight.price, passengers.length, flight.currency),
    };

    this.submitting.set(true);
    this.submitError.set(null);

    this.bookingService
      .create(booking)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: created => this.router.navigate(['/bookings', created.id], { state: { justBooked: true, booking: created } }),
        error: (error: ApiError) => this.submitError.set(error.message),
      });
  }

  private setPassengerCount(count: number): void {
    // Keep whatever was already typed if the flight is reloaded.
    while (this.passengers.length < count) {
      this.passengers.push(this.createPassengerGroup());
    }
    while (this.passengers.length > count) {
      this.passengers.removeAt(this.passengers.length - 1);
    }
  }

  private createPassengerGroup(): FormGroup {
    return this.fb.nonNullable.group({
      title: ['Mr' as PassengerTitle, Validators.required],
      firstName: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(NAME_PATTERN)]],
      lastName: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(NAME_PATTERN)]],
      age: [null as number | null, [Validators.required, Validators.min(1), Validators.max(110)]],
    });
  }
}
