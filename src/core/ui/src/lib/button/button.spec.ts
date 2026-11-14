import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiButton, UiButtonVariant } from './button';

@Component({
  imports: [UiButton],
  template: `
    <button uiButton [variant]="variant()">Go</button>
    <a uiButton variant="primary" href="/x">Link</a>
  `,
})
class Host {
  readonly variant = signal<UiButtonVariant>('secondary');
}

describe('UiButton', () => {
  it('applies the variant class and defaults to secondary', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.classList).toContain('secondary');
    expect(button.classList).not.toContain('primary');

    fixture.componentInstance.variant.set('primary');
    await fixture.whenStable();
    expect(button.classList).toContain('primary');
    expect(button.classList).not.toContain('secondary');
  });

  it('also works on anchors', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const a = (fixture.nativeElement as HTMLElement).querySelector('a');
    expect(a?.classList).toContain('primary');
    expect(a?.textContent).toContain('Link');
  });
});
