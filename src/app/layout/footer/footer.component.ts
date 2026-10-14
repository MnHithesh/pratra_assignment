import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="container inner">
        <p>Assignment done by <strong>Hithesh M N</strong></p>
        <p class="note">Flight data is mock data for demo purposes · © {{ year }} Skyfinder</p>
      </div>
    </footer>
  `,
  styles: `
    footer {
      border-top: 1px solid var(--sf-border);
      background: var(--sf-surface);
      font-size: 0.875rem;
    }
    .inner {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px 24px;
      padding-top: 20px;
      padding-bottom: 20px;
    }
    p { margin: 0; }
    .note { color: var(--sf-muted); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
