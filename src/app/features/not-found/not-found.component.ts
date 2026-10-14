import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { MessagePanelComponent } from '../../shared/components/message-panel/message-panel.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MessagePanelComponent],
  template: `
    <div class="container page">
      <div class="panel">
        <app-message-panel kind="empty" title="Page not found" message="This page doesn't exist or has moved.">
          <a mat-flat-button routerLink="/">Go to home</a>
        </app-message-panel>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
