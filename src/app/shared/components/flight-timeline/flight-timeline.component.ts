import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { dayDifference } from '../../../core/utils/date.util';
import { DurationPipe } from '../../pipes/duration.pipe';
import { StopsPipe } from '../../pipes/stops.pipe';

/** Departure --- duration/stops --- arrival. Used on cards, details and bookings. */
@Component({
  selector: 'app-flight-timeline',
  standalone: true,
  imports: [DatePipe, DurationPipe, StopsPipe],
  templateUrl: './flight-timeline.component.html',
  styleUrl: './flight-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.large]': 'size() === "large"' },
})
export class FlightTimelineComponent {
  readonly from = input.required<string>();
  readonly to = input.required<string>();
  readonly departureTime = input.required<Date | string>();
  readonly arrivalTime = input.required<Date | string>();
  readonly durationMinutes = input.required<number>();
  readonly stops = input(0);
  readonly fromLabel = input<string | null>(null);
  readonly toLabel = input<string | null>(null);
  readonly size = input<'compact' | 'large'>('compact');

  protected readonly stopMarkers = computed(() => Array.from({ length: this.stops() }));

  /** "+1" when the flight lands on a later day than it leaves. */
  protected readonly dayOffset = computed(() =>
    dayDifference(new Date(this.departureTime()), new Date(this.arrivalTime())),
  );
}
