import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { map } from 'rxjs';

import { FilterOptions, FlightFilters } from '../../../core/models/flight-search.model';

const STOP_LABELS: Record<number, string> = { 0: 'Non-stop', 1: '1 stop', 2: '2+ stops' };

@Component({
  selector: 'app-flight-filters',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatSliderModule],
  templateUrl: './flight-filters.component.html',
  styleUrl: './flight-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightFiltersComponent {
  private readonly fb = inject(FormBuilder);

  // A setter rather than a signal input: the form controls have to exist before
  // the template binds to them, and an effect would run too late for that.
  @Input({ required: true })
  set options(options: FilterOptions) {
    this.current.set(options);
    this.rebuild(options);
  }

  protected readonly current = signal<FilterOptions>({ airlines: [], stops: [], minPrice: 0, maxPrice: 0 });
  readonly filtersChange = output<FlightFilters>();

  protected readonly stopLabels = STOP_LABELS;

  // Checkbox lists depend on the results, so they are records filled in rebuild().
  private readonly stops = new FormRecord<FormControl<boolean>>({});
  private readonly airlines = new FormRecord<FormControl<boolean>>({});

  protected readonly form = this.fb.group({
    maxPrice: this.fb.control<number | null>(null),
    stops: this.stops,
    airlines: this.airlines,
  });

  constructor() {
    this.form.valueChanges
      .pipe(
        map(() => this.currentFilters()),
        takeUntilDestroyed(),
      )
      .subscribe(filters => this.filtersChange.emit(filters));
  }

  reset(): void {
    this.rebuild(this.current());
  }

  protected formatPrice = (value: number): string => `₹${Math.round(value / 1000)}k`;

  /** New results mean new airlines and prices, so the filters start over. */
  private rebuild(options: FilterOptions): void {
    const { stops, airlines } = this;

    Object.keys(stops.controls).forEach(key => stops.removeControl(key, { emitEvent: false }));
    Object.keys(airlines.controls).forEach(key => airlines.removeControl(key, { emitEvent: false }));
    options.stops.forEach(stop => stops.addControl(String(stop), new FormControl(false, { nonNullable: true }), { emitEvent: false }));
    options.airlines.forEach(name => airlines.addControl(name, new FormControl(false, { nonNullable: true }), { emitEvent: false }));

    // One emit for the whole rebuild instead of one per control.
    this.form.controls.maxPrice.setValue(options.maxPrice || null);
  }

  private currentFilters(): FlightFilters {
    const { maxPrice, stops, airlines } = this.form.getRawValue();
    const atMax = maxPrice != null && maxPrice >= this.current().maxPrice;

    return {
      maxPrice: atMax ? null : maxPrice,
      stops: Object.keys(stops).filter(key => stops[key]).map(Number),
      airlines: Object.keys(airlines).filter(key => airlines[key]),
    };
  }
}
