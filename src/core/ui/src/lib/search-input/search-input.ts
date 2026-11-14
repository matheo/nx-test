import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';

let nextId = 0;

@Component({
  selector: 'ui-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="visually-hidden" [for]="inputId">{{ label() }}</label>
    <input
      class="field"
      type="search"
      [id]="inputId"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="onInput($event)"
    />
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .field {
      box-sizing: border-box;
      width: 100%;
      min-width: 220px;
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
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class UiSearchInput {
  readonly value = model('');
  readonly placeholder = input('Search...');
  readonly label = input('Search');

  protected readonly inputId = `ui-search-input-${nextId++}`;

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
