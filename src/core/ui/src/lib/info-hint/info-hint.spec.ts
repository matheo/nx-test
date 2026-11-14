import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiInfoHint } from './info-hint';

@Component({
  imports: [UiInfoHint],
  template: `<ui-info-hint text="Some help" />`,
})
class Host {}

describe('UiInfoHint', () => {
  it('exposes the text as title and aria-label', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const hint = (fixture.nativeElement as HTMLElement).querySelector('.hint');
    expect(hint?.getAttribute('title')).toBe('Some help');
    expect(hint?.getAttribute('aria-label')).toBe('Some help');
  });
});
