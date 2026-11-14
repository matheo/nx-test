import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';

export interface UiSelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'ui-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <select
      class="field"
      [attr.aria-label]="label()"
      (change)="onChange($event)"
    >
      @for (option of options(); track option.value) {
        <option [selected]="option.value === value()" [value]="$index">
          {{ option.label }}
        </option>
      }
    </select>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .field {
      padding: var(--ui-space-2) var(--ui-space-3);
      border: 1px solid var(--ui-color-border);
      border-radius: var(--ui-radius-sm);
      background: var(--ui-color-surface);
      color: var(--ui-color-text);
      font: inherit;
    }
    .field:focus-visible {
      outline: 2px solid var(--ui-color-focus);
      outline-offset: 1px;
    }
  `,
})
export class UiSelect<T> {
  readonly options = input.required<readonly UiSelectOption<T>[]>();
  readonly value = model<T>();
  readonly label = input('Select');

  protected onChange(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    const option = this.options()[index];
    if (option) {
      this.value.set(option.value);
    }
  }
}
