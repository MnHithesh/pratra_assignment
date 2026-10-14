import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="brand" aria-label="Skyfinder home">
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z"
        />
      </svg>
      <span>Skyfinder</span>
    </a>
  `,
  styles: `
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--sf-primary);
      text-decoration: none;
      font-weight: 700;
      font-size: 1.2rem;
      letter-spacing: -0.01em;
    }
    svg { transform: rotate(45deg); }
    span { color: var(--sf-ink); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {}
