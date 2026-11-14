import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiSelect } from './select';

@Component({
  imports: [UiSelect],
  template: `<ui-select [options]="options" [(value)]="value" />`,
})
class Host {
  readonly options = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
  ];
  readonly value = signal<number | undefined>(5);
}

describe('UiSelect', () => {
  it('emits the value of the chosen option', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      'select',
    ) as HTMLSelectElement;
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(20);
  });

  it('preselects the current value', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      'select',
    ) as HTMLSelectElement;
    expect(select.selectedIndex).toBe(0);
  });
});
