import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiSearchInput } from './search-input';

@Component({
  imports: [UiSearchInput],
  template: `<ui-search-input [(value)]="query" />`,
})
class Host {
  readonly query = signal('');
}

describe('UiSearchInput', () => {
  it('emits the typed text', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = 'visa';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.query()).toBe('visa');
  });

  it('has a label and the default placeholder', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('label')).not.toBeNull();
    expect(el.querySelector('input')?.getAttribute('placeholder')).toBe(
      'Search...',
    );
  });
});
