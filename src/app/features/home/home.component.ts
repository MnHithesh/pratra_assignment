import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FlightSearchCriteria } from '../../core/models/flight-search.model';
import { AuthService } from '../../core/services/auth.service';
import { addDays, startOfToday, toIsoDate } from '../../core/utils/date.util';
import { criteriaToParams } from '../../core/utils/search-params.util';
import { FlightSearchFormComponent } from '../../shared/components/flight-search-form/flight-search-form.component';

interface PopularRoute {
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule, FlightSearchFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  protected readonly user = inject(AuthService).user;

  protected readonly popularRoutes: PopularRoute[] = [
    { from: 'BLR', to: 'DEL', fromCity: 'Bengaluru', toCity: 'New Delhi' },
    { from: 'BOM', to: 'GOI', fromCity: 'Mumbai', toCity: 'Goa' },
    { from: 'DEL', to: 'DXB', fromCity: 'New Delhi', toCity: 'Dubai' },
    { from: 'BLR', to: 'SIN', fromCity: 'Bengaluru', toCity: 'Singapore' },
    { from: 'MAA', to: 'DEL', fromCity: 'Chennai', toCity: 'New Delhi' },
    { from: 'HYD', to: 'BOM', fromCity: 'Hyderabad', toCity: 'Mumbai' },
  ];

  protected onSearch(criteria: FlightSearchCriteria): void {
    this.router.navigate(['/flights'], { queryParams: criteriaToParams(criteria) });
  }

  protected searchRoute(route: PopularRoute): void {
    this.onSearch({
      from: route.from,
      to: route.to,
      departDate: toIsoDate(addDays(startOfToday(), 7)),
      returnDate: null,
      passengers: 1,
    });
  }
}
