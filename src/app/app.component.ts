import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

import { AuthService } from './core/services/auth.service';
import { MemberLayoutComponent } from './layout/member-layout/member-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PublicLayoutComponent, MemberLayoutComponent],
  template: `
    @if (isLoggedIn()) {
      <app-member-layout />
    } @else {
      <app-public-layout />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly isLoggedIn = inject(AuthService).isLoggedIn;

  constructor() {
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
  }
}
