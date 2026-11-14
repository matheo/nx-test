import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiFormField } from './form-field';

@Component({
  imports: [UiFormField],
  template: `
    <ui-form-field label="Nombre" for="n" [error]="error()">
      <input id="n" />
    </ui-form-field>
  `,
})
class Host {
  readonly error = signal<string | null>(null);
}

describe('UiFormField', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return fixture;
  }
  const field = (el: HTMLElement) =>
    el.querySelector('ui-form-field') as HTMLElement;

  it('renders the label bound to the projected input', async () => {
    const el = (await setup()).nativeElement as HTMLElement;
    const label = el.querySelector('label') as HTMLLabelElement;
    expect(label.textContent).toContain('Nombre');
    expect(label.getAttribute('for')).toBe('n');
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('is valid without an error', async () => {
    const el = (await setup()).nativeElement as HTMLElement;
    expect(field(el).classList).not.toContain('invalid');
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows the error and invalid state when error is set', async () => {
    const fixture = await setup();
    fixture.componentInstance.error.set('Este campo es requerido!');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(field(el).classList).toContain('invalid');
    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'Este campo es requerido!',
    );
  });
});
