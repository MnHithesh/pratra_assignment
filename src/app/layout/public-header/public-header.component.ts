import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { BrandComponent } from '../brand/brand.component';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink, MatButtonModule, BrandComponent],
  template: `
    <header>
      <div class="container inner">
        <app-brand />
        <nav aria-label="Account">
          <a mat-button routerLink="/login">Log in</a>
          <a mat-flat-button routerLink="/signup">Sign up</a>
        </nav>
      </div>
    </header>
  `,
  styleUrl: '../header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicHeaderComponent {}
