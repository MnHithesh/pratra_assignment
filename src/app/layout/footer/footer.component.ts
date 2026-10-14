import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="container">
      <div class="bar">
        <p>Assignment done by <strong>Hithesh M N</strong></p>
        <p class="note">Flight data is mock data for demo purposes · © {{ year }} FlyFinder</p>
      </div>
    </footer>
  `,
  styles: `
    footer {
      display: block;
      padding-bottom: var(--sf-gap);
      font-size: 0.875rem;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 24px;
      padding: 14px 20px;
      background: var(--sf-surface);
      border: 1px solid var(--sf-border);
      border-radius: 16px;
    }
    p { margin: 0; }
    .note { color: var(--sf-muted); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
