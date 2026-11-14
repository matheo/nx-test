import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiDropdownMenu } from './dropdown-menu';

@Component({
  imports: [UiDropdownMenu],
  template: `
    <ui-dropdown-menu label="Acciones de Producto 1">
      <button type="button" role="menuitem" (click)="picked = picked + 1">
        Editar
      </button>
    </ui-dropdown-menu>
    <p id="outside">outside</p>
  `,
})
class Host {
  picked = 0;
}

describe('UiDropdownMenu', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      trigger: () =>
        el.querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement,
      menu: () => el.querySelector('[role="menu"]'),
    };
  }

  it('is closed at first and the trigger opens it', async () => {
    const { fixture, trigger, menu } = await render();
    expect(trigger().getAttribute('aria-label')).toBe('Acciones de Producto 1');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(menu()).toBeNull();

    trigger().click();
    await fixture.whenStable();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(menu()).not.toBeNull();
    expect(menu()?.textContent).toContain('Editar');
  });

  it('closes on Escape and focuses the trigger', async () => {
    const { fixture, trigger, menu } = await render();
    trigger().click();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on an outside click', async () => {
    const { fixture, el, trigger, menu } = await render();
    trigger().click();
    await fixture.whenStable();

    (el.querySelector('#outside') as HTMLElement).click();
    await fixture.whenStable();
    expect(menu()).toBeNull();
  });

  it('closes when an item is clicked', async () => {
    const { fixture, el, trigger, menu } = await render();
    trigger().click();
    await fixture.whenStable();

    (el.querySelector('[role="menuitem"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.picked).toBe(1);
    expect(menu()).toBeNull();
  });

  it('closes on window resize', async () => {
    const { fixture, trigger, menu } = await render();
    trigger().click();
    await fixture.whenStable();

    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();
    expect(menu()).toBeNull();
  });

  it('closes when a scrollable ancestor scrolls', async () => {
    const { fixture, el, trigger, menu } = await render();
    trigger().click();
    await fixture.whenStable();

    // `scroll` does not bubble; the menu must catch it in the capture phase.
    el.querySelector('#outside')?.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(menu()).toBeNull();
  });

  it('ignores document clicks while closed', async () => {
    const { fixture, el, trigger, menu } = await render();
    (el.querySelector('#outside') as HTMLElement).click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(menu()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('stops listening after it closes', async () => {
    const { fixture, el, trigger, menu } = await render();
    trigger().click();
    await fixture.whenStable();
    (el.querySelector('#outside') as HTMLElement).click();
    await fixture.whenStable();
    expect(menu()).toBeNull();

    trigger().click();
    await fixture.whenStable();
    expect(menu()).not.toBeNull();
  });
});
