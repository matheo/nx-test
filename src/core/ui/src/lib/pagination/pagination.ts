import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'ui-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="pagination" aria-label="Paginación">
      <button
        type="button"
        class="button"
        aria-label="Página anterior"
        [disabled]="page() <= 1"
        (click)="previous.emit()"
      >
        ‹
      </button>
      <span class="status" aria-live="polite">
        Página {{ page() }} de {{ pageCount() }}
      </span>
      <button
        type="button"
        class="button"
        aria-label="Página siguiente"
        [disabled]="page() >= pageCount()"
        (click)="next.emit()"
      >
        ›
      </button>
    </nav>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .pagination {
      display: flex;
      align-items: center;
      gap: var(--ui-space-2);
    }
    .status {
      font-size: var(--ui-font-size-sm);
      color: var(--ui-color-text-muted);
      white-space: nowrap;
    }
    .button {
      min-width: 2rem;
      padding: var(--ui-space-1) var(--ui-space-2);
      border: 1px solid var(--ui-color-border);
      border-radius: var(--ui-radius-sm);
      background: var(--ui-color-surface);
      color: var(--ui-color-text);
      font: inherit;
      cursor: pointer;
    }
    .button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .button:focus-visible {
      outline: 2px solid var(--ui-color-focus);
      outline-offset: 1px;
    }
  `,
})
export class UiPagination {
  readonly page = input.required<number>();
  readonly pageCount = input.required<number>();
  readonly previous = output<void>();
  readonly next = output<void>();
}
