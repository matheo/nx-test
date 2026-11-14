import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <span class="icon"><ng-content select="[uiHeaderIcon]" /></span>
      <h1 class="brand"><ng-content /></h1>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--ui-space-3);
      padding: var(--ui-space-4);
      background: var(--ui-color-surface);
      border-bottom: 1px solid var(--ui-color-border);
      color: var(--ui-color-text);
    }
    .icon {
      display: inline-flex;
    }
    .brand {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
  `,
})
export class UiHeader {}
