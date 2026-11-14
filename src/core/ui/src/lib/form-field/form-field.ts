import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Label + projected native input + error message.
 * Uses no encapsulation so the projected input can be styled; every selector
 * is scoped under `ui-form-field`.
 */
@Component({
  selector: 'ui-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[class.invalid]': '!!error()' },
  template: `
    <label class="ui-form-field__label" [attr.for]="for()">{{ label() }}</label>
    <ng-content />
    @if (error(); as message) {
      <span class="ui-form-field__error" role="alert">{{ message }}</span>
    }
  `,
  styles: `
    ui-form-field {
      display: flex;
      flex-direction: column;
      gap: var(--ui-space-1);
    }
    ui-form-field .ui-form-field__label {
      font-size: var(--ui-font-size-sm);
      font-weight: 600;
      color: var(--ui-color-text);
    }
    ui-form-field input {
      box-sizing: border-box;
      width: 100%;
      padding: var(--ui-space-2) var(--ui-space-3);
      border: 1px solid var(--ui-color-border);
      border-radius: var(--ui-radius-sm);
      background: var(--ui-color-surface);
      color: var(--ui-color-text);
      font: inherit;
    }
    ui-form-field input:disabled {
      background: var(--ui-color-page-bg);
      color: var(--ui-color-text-muted);
    }
    ui-form-field input:focus-visible {
      outline: 2px solid var(--ui-color-focus);
      outline-offset: 1px;
    }
    ui-form-field.invalid input {
      border-color: var(--ui-color-error);
    }
    ui-form-field .ui-form-field__error {
      font-size: var(--ui-font-size-sm);
      color: var(--ui-color-error);
    }
  `,
})
export class UiFormField {
  readonly label = input.required<string>();
  readonly error = input<string | null>(null);
  /** Id of the projected input, wired to the label's `for`. */
  readonly for = input<string>();
}
