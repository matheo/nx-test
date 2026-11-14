import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary';

@Component({
  // Attribute-style component that enhances native <button>/<a>.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[uiButton], a[uiButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.primary]': "variant() === 'primary'",
    '[class.secondary]': "variant() === 'secondary'",
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: var(--ui-space-2) var(--ui-space-5);
      border: 0;
      border-radius: var(--ui-radius-sm);
      color: var(--ui-color-text);
      font: inherit;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }
    :host(.primary) {
      background: var(--ui-color-primary);
    }
    :host(.secondary) {
      background: var(--ui-color-secondary-bg);
    }
    :host(:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
    :host(:focus-visible) {
      outline: 2px solid var(--ui-color-focus);
      outline-offset: 2px;
    }
  `,
})
export class UiButton {
  readonly variant = input<UiButtonVariant>('secondary');
}
