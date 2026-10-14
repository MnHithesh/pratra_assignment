import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Flight } from '../../../core/models/flight.model';
import { AirlineLogoComponent } from '../airline-logo/airline-logo.component';
import { FlightTimelineComponent } from '../flight-timeline/flight-timeline.component';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CurrencyPipe, MatIconModule, AirlineLogoComponent, FlightTimelineComponent],
  templateUrl: './flight-card.component.html',
  styleUrl: './flight-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightCardComponent {
  readonly flight = input.required<Flight>();
}
