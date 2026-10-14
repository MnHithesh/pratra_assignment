import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';
import { MemberHeaderComponent } from '../member-header/member-header.component';

/** Layout once the user is logged in: same pages, header with the full menu. */
@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [RouterOutlet, MemberHeaderComponent, FooterComponent],
  template: `
    <app-member-header />
    <main><router-outlet /></main>
    <app-footer />
  `,
  styleUrl: '../layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberLayoutComponent {}
