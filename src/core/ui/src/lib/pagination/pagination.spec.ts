import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiPagination } from './pagination';

@Component({
  imports: [UiPagination],
  template: `
    <ui-pagination
      [page]="page()"
      [pageCount]="pageCount()"
      (previous)="previousCount = previousCount + 1"
      (next)="nextCount = nextCount + 1"
    />
  `,
})
class Host {
  readonly page = signal(1);
  readonly pageCount = signal(3);
  previousCount = 0;
  nextCount = 0;
}

describe('UiPagination', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const button = (label: string) =>
      el.querySelector(`[aria-label="${label}"]`) as HTMLButtonElement;
    return {
      fixture,
      el,
      prev: () => button('Página anterior'),
      next: () => button('Página siguiente'),
    };
  }

  it('disables previous on the first page and next on the last', async () => {
    const { fixture, el, prev, next } = await render();
    expect(el.textContent).toContain('Página 1 de 3');
    expect(prev().disabled).toBe(true);
    expect(next().disabled).toBe(false);

    fixture.componentInstance.page.set(3);
    await fixture.whenStable();
    expect(prev().disabled).toBe(false);
    expect(next().disabled).toBe(true);
  });

  it('emits previous and next on click', async () => {
    const { fixture, prev, next } = await render();
    fixture.componentInstance.page.set(2);
    await fixture.whenStable();
    next().click();
    prev().click();
    expect(fixture.componentInstance.nextCount).toBe(1);
    expect(fixture.componentInstance.previousCount).toBe(1);
  });
});
