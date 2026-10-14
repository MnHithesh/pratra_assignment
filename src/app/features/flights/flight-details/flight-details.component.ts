import { AsyncPipe, CurrencyPipe, DatePipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, combineLatest, map, Observable, of, startWith, switchMap } from 'rxjs';

import { ApiError } from '../../../core/http/api-error';
import { Airport } from '../../../core/models/airport.model';
import { Flight } from '../../../core/models/flight.model';
import { AirportService } from '../../../core/services/airport.service';
import { AuthService } from '../../../core/services/auth.service';
import { FlightService } from '../../../core/services/flight.service';
import { parseIsoDate, startOfToday, toIsoDate } from '../../../core/utils/date.util';
import { calculateFare } from '../../../core/utils/flight.util';
import { AirlineLogoComponent } from '../../../shared/components/airline-logo/airline-logo.component';
import { FlightTimelineComponent } from '../../../shared/components/flight-timeline/flight-timeline.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { MessagePanelComponent } from '../../../shared/components/message-panel/message-panel.component';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

type DetailsState =
  | { status: 'loading' }
  | { status: 'loaded'; flight: Flight }
  | { status: 'error'; error: ApiError };

@Component({
  selector: 'app-flight-details',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    AirlineLogoComponent,
    FlightTimelineComponent,
    LoadingStateComponent,
    MessagePanelComponent,
    DurationPipe,
  ],
  templateUrl: './flight-details.component.html',
  styleUrl: './flight-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly flightService = inject(FlightService);
  private readonly airportService = inject(AirportService);
  protected readonly isLoggedIn = inject(AuthService).isLoggedIn;

  private readonly request$ = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
    map(([params, query]) => {
      // Fall back to sensible values if someone opens the link without them.
      const date = parseIsoDate(query.get('date')) ?? startOfToday();
      const pax = Number(query.get('pax'));
      return {
        id: params.get('id') ?? '',
        date: toIsoDate(date),
        passengers: Number.isInteger(pax) && pax >= 1 && pax <= 9 ? pax : 1,
      };
    }),
  );

  protected readonly vm$ = this.request$.pipe(
    switchMap(request => {
      const state$: Observable<DetailsState> = this.flightService.getFlight(request.id, request.date).pipe(
        map(flight => ({ status: 'loaded', flight }) as DetailsState),
        catchError((error: ApiError) => of<DetailsState>({ status: 'error', error })),
        startWith<DetailsState>({ status: 'loading' }),
      );

      return combineLatest({
        state: state$,
        airports: this.airportService.byCode$.pipe(catchError(() => of(new Map<string, Airport>()))),
      }).pipe(map(vm => ({ ...vm, request })));
    }),
  );

  protected fareFor(flight: Flight, passengers: number) {
    return calculateFare(flight.price, passengers, flight.currency);
  }

  protected airportLabel(airports: Map<string, Airport>, code: string): string {
    const airport = airports.get(code);
    return airport ? `${airport.city} · ${airport.name}` : code;
  }

  protected goBack(): void {
    // Angular stores a navigationId in history state. 1 means this page was opened
    // directly (new tab, shared link), so there is no results page to go back to.
    const navigationId = (this.location.getState() as { navigationId?: number } | null)?.navigationId ?? 1;
    if (navigationId > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
