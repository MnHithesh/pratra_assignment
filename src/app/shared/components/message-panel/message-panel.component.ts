import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

type PanelKind = 'error' | 'empty' | 'info';

const ICONS: Record<PanelKind, string> = {
  error: 'cloud_off',
  empty: 'travel_explore',
  info: 'info',
};

/** Used for error and empty states. Extra content (links etc.) can be projected in. */
@Component({
  selector: 'app-message-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="panel-body" [class.error]="kind() === 'error'" [attr.role]="kind() === 'error' ? 'alert' : null">
      <mat-icon class="icon">{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      @if (message()) {
        <p>{{ message() }}</p>
      }
      <div class="actions">
        @if (actionLabel()) {
          <button mat-flat-button (click)="action.emit()">{{ actionLabel() }}</button>
        }
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .panel-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px 20px;
      gap: 6px;
    }
    .icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--sf-muted);
      margin-bottom: 6px;
    }
    .error .icon { color: var(--sf-danger); }
    h3 { font-size: 1.1rem; }
    p { margin: 0; color: var(--sf-muted); max-width: 420px; }
    .actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; justify-content: center; }
    .actions:empty { display: none; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagePanelComponent {
  readonly kind = input<PanelKind>('info');
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();

  protected readonly icon = computed(() => ICONS[this.kind()]);
}
