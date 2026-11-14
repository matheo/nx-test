import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiConfirmDialog } from './confirm-dialog';

@Component({
  imports: [UiConfirmDialog],
  template: `
    <ui-confirm-dialog
      [open]="open()"
      [busy]="busy()"
      (confirmed)="confirmed = confirmed + 1"
      (cancelled)="cancelled = cancelled + 1"
    >
      ¿Seguro?
    </ui-confirm-dialog>
  `,
})
class Host {
  readonly open = signal(false);
  readonly busy = signal(false);
  confirmed = 0;
  cancelled = 0;
}

describe('UiConfirmDialog', () => {
  beforeAll(() => {
    // jsdom may not implement the modal dialog API.
    const proto = HTMLDialogElement.prototype;
    if (!proto.showModal) {
      proto.showModal = function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      };
    }
    if (!proto.close) {
      proto.close = function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      };
    }
  });

  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      dialog: () => el.querySelector('dialog') as HTMLDialogElement,
      buttons: () =>
        Array.from(el.querySelectorAll('button')) as HTMLButtonElement[],
    };
  }

  it('opens and closes the dialog with the open input', async () => {
    const { fixture, host, dialog } = await render();
    expect(dialog().open).toBe(false);

    host.open.set(true);
    await fixture.whenStable();
    expect(dialog().open).toBe(true);
    expect(dialog().textContent).toContain('¿Seguro?');

    host.open.set(false);
    await fixture.whenStable();
    expect(dialog().open).toBe(false);
  });

  it('labels the dialog with the projected message', async () => {
    const { dialog } = await render();
    const id = dialog().getAttribute('aria-labelledby');
    expect(id).toBeTruthy();
    expect(dialog().getAttribute('aria-describedby')).toBe(id);
    expect(dialog().querySelector(`#${id}`)?.textContent).toContain('¿Seguro?');
  });

  it('emits cancelled from the Cancelar button', async () => {
    const { host, buttons } = await render();
    expect(buttons()[0].textContent?.trim()).toBe('Cancelar');
    buttons()[0].click();
    expect(host.cancelled).toBe(1);
    expect(host.confirmed).toBe(0);
  });

  it('emits confirmed from the Confirmar button', async () => {
    const { host, buttons } = await render();
    expect(buttons()[1].textContent?.trim()).toBe('Confirmar');
    buttons()[1].click();
    expect(host.confirmed).toBe(1);
    expect(host.cancelled).toBe(0);
  });

  it('emits cancelled on the native cancel event and prevents closing', async () => {
    const { host, dialog } = await render();
    const event = new Event('cancel', { cancelable: true });
    dialog().dispatchEvent(event);
    expect(host.cancelled).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('emits cancelled on a backdrop click only', async () => {
    const { host, dialog } = await render();
    dialog().click();
    expect(host.cancelled).toBe(1);
    (dialog().querySelector('.ui-confirm-dialog__message') as HTMLElement).click();
    expect(host.cancelled).toBe(1);
  });

  it('disables both buttons while busy', async () => {
    const { fixture, host, buttons } = await render();
    host.busy.set(true);
    await fixture.whenStable();
    expect(buttons().every((b) => b.disabled)).toBe(true);
  });
});
