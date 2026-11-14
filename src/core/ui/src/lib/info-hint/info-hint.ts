import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-info-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="hint"
      role="img"
      [attr.title]="text()"
      [attr.aria-label]="text()"
      >i</span
    >
  `,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
    .hint {
      background: var(--ui-color-text-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      border: 1px solid var(--ui-color-text-muted);
      border-radius: var(--ui-radius-full);
      color: var(--ui-color-surface);
      font-size: 0.5rem;
      font-weight: 700;
      font-style: normal;
      cursor: help;
    }
  `,
})
export class UiInfoHint {
  readonly text = input.required<string>();
}
