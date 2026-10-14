import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading" role="status" aria-live="polite">
      <mat-spinner diameter="36" strokeWidth="3" />
      <p>{{ message() }}</p>
    </div>
  `,
  styles: `
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 48px 16px;
      color: var(--sf-muted);
    }
    p { margin: 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  readonly message = input('Loading…');
}
