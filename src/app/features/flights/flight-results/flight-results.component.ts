import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

import { ApiError } from '../../../core/http/api-error';
import { Airport } from '../../../core/models/airport.model';
import { Flight } from '../../../core/models/flight.model';
import { FlightFilters, FlightSearchCriteria, SortOption, TripLeg } from '../../../core/models/flight-search.model';
import { AirportService } from '../../../core/services/airport.service';
import { FlightService } from '../../../core/services/flight.service';
import { applyFilters, buildFilterOptions, sortFlights } from '../../../core/utils/flight.util';
import { criteriaFromParams, criteriaToParams, sameCriteria } from '../../../core/utils/search-params.util';
import { FlightCardComponent } from '../../../shared/components/flight-card/flight-card.component';
import { FlightSearchFormComponent } from '../../../shared/components/flight-search-form/flight-search-form.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { MessagePanelComponent } from '../../../shared/components/message-panel/message-panel.component';
import { FlightFiltersComponent } from '../flight-filters/flight-filters.component';

type SearchState =
  | { status: 'loading' }
  | { status: 'loaded'; flights: Flight[] }
  | { status: 'error'; message: string }
  | { status: 'invalid' };

const NO_FILTERS: FlightFilters = { maxPrice: null, stops: [], airlines: [] };

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    FlightCardComponent,
    FlightFiltersComponent,
    FlightSearchFormComponent,
    LoadingStateComponent,
    MessagePanelComponent,
  ],
  templateUrl: './flight-results.component.html',
  styleUrl: './flight-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly flightService = inject(FlightService);
  private readonly airportService = inject(AirportService);

  private readonly filtersPanel = viewChild(FlightFiltersComponent);
  private readonly retry$ = new Subject<void>();
  private readonly filters$ = new BehaviorSubject<FlightFilters>(NO_FILTERS);
  protected readonly sort$ = new BehaviorSubject<SortOption>('price');

  protected readonly editingSearch = signal(false);
  protected readonly showFilters = signal(false);

  private readonly criteria$ = this.route.queryParamMap.pipe(
    map(criteriaFromParams),
    distinctUntilChanged(sameCriteria),
  );

  private readonly leg$: Observable<TripLeg> = this.route.queryParamMap.pipe(
    map(params => (params.get('leg') === 'return' ? 'return' : 'onward') as TripLeg),
    distinctUntilChanged(),
  );

  /** The search for the leg on screen. The return leg is the same search, reversed. */
  private readonly legCriteria$ = combineLatest([this.criteria$, this.leg$]).pipe(
    map(([criteria, leg]) => {
      if (!criteria || leg === 'onward' || !criteria.returnDate) return criteria;
      return { ...criteria, from: criteria.to, to: criteria.from, departDate: criteria.returnDate };
    }),
    distinctUntilChanged(sameCriteria),
  );

  // switchMap drops the previous request if the user searches again before it finishes.
  private readonly state$: Observable<SearchState> = combineLatest([
    this.legCriteria$,
    this.retry$.pipe(startWith(undefined)),
  ]).pipe(
    switchMap(([criteria]) => {
      if (!criteria) return of<SearchState>({ status: 'invalid' });

      return this.flightService.search(criteria).pipe(
        map(flights => ({ status: 'loaded', flights }) as SearchState),
        catchError((error: ApiError) => of<SearchState>({ status: 'error', message: error.message })),
        startWith<SearchState>({ status: 'loading' }),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private readonly flights$ = this.state$.pipe(map(state => (state.status === 'loaded' ? state.flights : [])));

  private readonly visibleFlights$ = combineLatest([
    this.flights$,
    this.filters$.pipe(debounceTime(150), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))),
    this.sort$,
  ]).pipe(map(([flights, filters, sort]) => sortFlights(applyFilters(flights, filters), sort)));

  private readonly airports$ = this.airportService.byCode$.pipe(catchError(() => of(new Map<string, Airport>())));

  protected readonly vm$ = combineLatest({
    criteria: this.criteria$,
    legCriteria: this.legCriteria$,
    leg: this.leg$,
    state: this.state$,
    flights: this.visibleFlights$,
    filterOptions: this.flights$.pipe(map(buildFilterOptions)),
    sort: this.sort$,
    airports: this.airports$,
  });

  protected cityName(airports: Map<string, Airport>, code: string): string {
    return airports.get(code)?.city ?? code;
  }

  protected onSearch(criteria: FlightSearchCriteria): void {
    this.editingSearch.set(false);
    this.router.navigate([], { queryParams: criteriaToParams(criteria) });
  }

  protected switchLeg(leg: TripLeg): void {
    this.router.navigate([], { queryParams: { leg: leg === 'return' ? 'return' : null }, queryParamsHandling: 'merge' });
  }

  protected onFiltersChange(filters: FlightFilters): void {
    this.filters$.next(filters);
  }

  protected clearFilters(): void {
    this.filtersPanel()?.reset();
  }

  protected retry(): void {
    this.retry$.next();
  }

  protected detailsParams(criteria: FlightSearchCriteria) {
    return { date: criteria.departDate, pax: criteria.passengers };
  }
}
