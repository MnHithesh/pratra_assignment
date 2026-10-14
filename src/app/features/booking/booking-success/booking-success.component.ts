import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Plane flies an arc, then a tick draws itself in. Pure CSS/SVG.
 * With reduced motion turned on it just shows the final tick.
 */
@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './booking-success.component.html',
  styleUrl: './booking-success.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingSuccessComponent {
  protected readonly sparks = Array.from({ length: 8 }, (_, i) => i * 45);
}
