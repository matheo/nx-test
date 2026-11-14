import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-table-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="scroll"><ng-content /></div>
      <div class="footer"><ng-content select="[uiTableFooter]" /></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .card {
      background: var(--ui-color-surface);
      border: 1px solid var(--ui-color-border);
      border-radius: var(--ui-radius-md);
      overflow: hidden;
    }
    .scroll {
      overflow-x: auto;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ui-space-3);
      padding: var(--ui-space-3) var(--ui-space-4);
      border-top: 1px solid var(--ui-color-border);
    }
    .footer:empty {
      display: none;
    }
  `,
})
export class UiTableCard {}
