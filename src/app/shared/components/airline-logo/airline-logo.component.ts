import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Rough brand colours so airlines are easy to tell apart in the list.
const AIRLINE_COLORS: Record<string, string> = {
  '6E': '#1b2b8f',
  AI: '#c8102e',
  QP: '#f26522',
  SG: '#d71920',
  IX: '#e8722a',
  EK: '#b5121b',
  SQ: '#14315c',
};

@Component({
  selector: 'app-airline-logo',
  standalone: true,
  template: `<span class="logo" [style.background]="color()" [attr.aria-label]="name()" role="img">{{ code() }}</span>`,
  styles: `
    :host { display: inline-flex; }
    .logo {
      display: inline-grid;
      place-items: center;
      width: var(--logo-size, 40px);
      height: var(--logo-size, 40px);
      border-radius: 10px;
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.02em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AirlineLogoComponent {
  readonly code = input.required<string>();
  readonly name = input('');

  protected readonly color = computed(() => AIRLINE_COLORS[this.code()] ?? '#41545b');
}
