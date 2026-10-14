import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroupDirective, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { catchError, combineLatest, filter, map, Observable, of, startWith } from 'rxjs';

import { Airport } from '../../../core/models/airport.model';
import { FlightSearchCriteria } from '../../../core/models/flight-search.model';
import { AirportService } from '../../../core/services/airport.service';
import { addDays, parseIsoDate, startOfToday, toIsoDate } from '../../../core/utils/date.util';
import {
  airportSelectedValidator,
  differentAirportsValidator,
  isAirport,
  notInPastValidator,
  returnAfterDepartureValidator,
} from '../../validators/flight-search.validators';

/** Shows a field as invalid when the whole form has a matching cross-field error. */
class GroupErrorMatcher implements ErrorStateMatcher {
  constructor(private readonly groupError: string) {}

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) return false;
    const touched = control.touched || !!form?.submitted;
    return touched && (control.invalid || !!form?.form.hasError(this.groupError));
  }
}

@Component({
  selector: 'app-flight-search-form',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './flight-search-form.component.html',
  styleUrl: './flight-search-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.compact]': 'compact()' },
})
export class FlightSearchFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly airportService = inject(AirportService);

  /** Pre-fills the form, e.g. on the results page. */
  readonly criteria = input<FlightSearchCriteria | null>(null);
  readonly compact = input(false);
  readonly submitLabel = input('Search flights');
  readonly search = output<FlightSearchCriteria>();

  protected readonly today = startOfToday();
  protected readonly passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  protected readonly airportsUnavailable = signal(false);
  protected readonly sameAirportMatcher = new GroupErrorMatcher('sameAirport');
  protected readonly returnDateMatcher = new GroupErrorMatcher('returnBeforeDeparture');

  protected readonly form = this.fb.group(
    {
      from: this.fb.control<Airport | string | null>(null, [Validators.required, airportSelectedValidator]),
      to: this.fb.control<Airport | string | null>(null, [Validators.required, airportSelectedValidator]),
      departDate: this.fb.control<Date | null>(addDays(this.today, 7), [Validators.required, notInPastValidator]),
      returnDate: this.fb.control<Date | null>(null, notInPastValidator),
      passengers: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1), Validators.max(9)]),
    },
    {
      validators: [
        differentAirportsValidator('from', 'to'),
        returnAfterDepartureValidator('departDate', 'returnDate'),
      ],
    },
  );

  private readonly airports$ = this.airportService.airports$.pipe(
    catchError(() => {
      this.airportsUnavailable.set(true);
      return of([] as Airport[]);
    }),
  );

  protected readonly fromOptions$ = this.suggestionsFor(this.form.controls.from);
  protected readonly toOptions$ = this.suggestionsFor(this.form.controls.to);

  constructor() {
    // Fill the form once both the criteria and the airport list are available.
    combineLatest([toObservable(this.criteria), this.airportService.byCode$.pipe(catchError(() => of(null)))])
      .pipe(
        filter(([criteria, airports]) => !!criteria && !!airports),
        takeUntilDestroyed(),
      )
      .subscribe(([criteria, airports]) => this.prefill(criteria!, airports!));
  }

  protected displayAirport(value: Airport | string | null): string {
    if (!value) return '';
    return isAirport(value) ? `${value.city} (${value.code})` : value;
  }

  protected swapAirports(): void {
    const { from, to } = this.form.getRawValue();
    this.form.patchValue({ from: to, to: from });
  }

  protected clearReturn(): void {
    this.form.controls.returnDate.setValue(null);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.search.emit({
      from: (value.from as Airport).code,
      to: (value.to as Airport).code,
      departDate: toIsoDate(value.departDate!),
      returnDate: value.returnDate ? toIsoDate(value.returnDate) : null,
      passengers: value.passengers,
    });
  }

  private prefill(criteria: FlightSearchCriteria, airports: Map<string, Airport>): void {
    this.form.patchValue({
      from: airports.get(criteria.from) ?? null,
      to: airports.get(criteria.to) ?? null,
      departDate: parseIsoDate(criteria.departDate),
      returnDate: parseIsoDate(criteria.returnDate),
      passengers: criteria.passengers,
    });
  }

  private suggestionsFor(control: FormControl<Airport | string | null>): Observable<Airport[]> {
    return combineLatest([this.airports$, control.valueChanges.pipe(startWith(control.value))]).pipe(
      map(([airports, value]) => {
        const term = (typeof value === 'string' ? value : '').trim().toLowerCase();
        if (!term) return airports;
        return airports.filter(
          a =>
            a.code.toLowerCase().startsWith(term) ||
            a.city.toLowerCase().includes(term) ||
            a.name.toLowerCase().includes(term),
        );
      }),
    );
  }
}
