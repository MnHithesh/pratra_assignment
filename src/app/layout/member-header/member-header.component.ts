import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../core/services/auth.service';
import { BrandComponent } from '../brand/brand.component';

@Component({
  selector: 'app-member-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule, BrandComponent],
  templateUrl: './member-header.component.html',
  styleUrls: ['../header.scss', './member-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberHeaderComponent {
  private readonly auth = inject(AuthService);

  protected readonly links = [
    { path: '/', label: 'Search flights', icon: 'search', exact: true },
    { path: '/bookings', label: 'My bookings', icon: 'confirmation_number', exact: false },
  ];

  protected readonly user = this.auth.user;
  protected readonly initials = computed(() =>
    (this.user()?.name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join(''),
  );

  protected logout(): void {
    this.auth.logout();
  }
}
