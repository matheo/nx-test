import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { UiButton } from '../button/button';

let nextId = 0;

/**
 * Modal confirmation built on a native `<dialog>`. The parent owns `open`:
 * Escape and backdrop clicks only emit `cancelled`. The message is projected.
 * Uses no encapsulation so the dialog's `::backdrop` can be styled; every
 * selector is scoped under `ui-confirm-dialog`.
 */
@Component({
  selector: 'ui-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [UiButton],
  template: `
    <dialog
      #dialog
      class="ui-confirm-dialog__dialog"
      [attr.aria-labelledby]="messageId"
      [attr.aria-describedby]="messageId"
      (cancel)="onNativeCancel($event)"
    >
      <div class="ui-confirm-dialog__message" [id]="messageId">
        <ng-content />
      </div>
      <div class="ui-confirm-dialog__footer">
        <button
          type="button"
          uiButton
          variant="secondary"
          autofocus
          [disabled]="busy()"
          (click)="cancelled.emit()"
        >
          {{ cancelLabel() }}
        </button>
        <button
          type="button"
          uiButton
          variant="primary"
          [disabled]="busy()"
          (click)="confirmed.emit()"
        >
          {{ confirmLabel() }}
        </button>
      </div>
    </dialog>
  `,
  styles: `
    ui-confirm-dialog .ui-confirm-dialog__dialog {
      box-sizing: border-box;
      width: 90vw;
      max-width: 600px;
      padding: 0;
      border: 0;
      border-radius: var(--ui-radius-md);
      background: var(--ui-color-surface);
      color: var(--ui-color-text);
      font-family: var(--ui-font-family);
      box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);
    }
    ui-confirm-dialog .ui-confirm-dialog__dialog::backdrop {
      background: rgb(0 0 0 / 0.55);
    }
    ui-confirm-dialog .ui-confirm-dialog__message {
      padding: var(--ui-space-6);
      font-size: 1.125rem;
    }
    ui-confirm-dialog .ui-confirm-dialog__footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--ui-space-4);
      padding: var(--ui-space-5) var(--ui-space-6);
      border-top: 1px solid var(--ui-color-border);
    }
    ui-confirm-dialog .ui-confirm-dialog__footer > button {
      width: 100%;
    }
  `,
})
export class UiConfirmDialog {
  readonly open = input(false);
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly messageId = `ui-confirm-dialog-message-${nextId++}`;

  private readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Registered imperatively: a template `(click)` on the non-interactive
    // <dialog> trips the a11y lint rules, and the backdrop click is a pointer
    // convenience (keyboard users have Escape and the Cancel button).
    afterNextRender(() =>
      this.dialog().nativeElement.addEventListener('click', (event) =>
        this.onDialogClick(event),
      ),
    );
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open()) {
        if (!dialog.open) {
          dialog.showModal();
          dialog.querySelector<HTMLElement>('[autofocus]')?.focus();
        }
      } else if (dialog.open) {
        dialog.close();
      }
    });
  }

  protected onNativeCancel(event: Event): void {
    // Keep `open` under the parent's control.
    event.preventDefault();
    this.cancelled.emit();
  }

  protected onDialogClick(event: MouseEvent): void {
    // Only the dialog element itself receives clicks that land on the backdrop.
    if (event.target === this.dialog().nativeElement) {
      this.cancelled.emit();
    }
  }
}
