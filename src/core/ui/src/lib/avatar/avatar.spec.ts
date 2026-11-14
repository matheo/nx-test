import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiAvatar } from './avatar';

@Component({
  imports: [UiAvatar],
  template: `<ui-avatar [src]="src()" [name]="name()" />`,
})
class Host {
  readonly src = signal('');
  readonly name = signal('Tarjeta de crédito oro');
}

describe('UiAvatar', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return fixture;
  }

  it('shows uppercase initials of the first two words when src is empty', async () => {
    const fixture = await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.initials')?.textContent?.trim()).toBe('TD');
  });

  it('renders an image with alt text when src is set', async () => {
    const fixture = await setup();
    fixture.componentInstance.src.set('https://example.com/logo.png');
    await fixture.whenStable();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Tarjeta de crédito oro');
  });

  it('falls back to initials when the image fails to load', async () => {
    const fixture = await setup();
    fixture.componentInstance.src.set('https://example.com/broken.png');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('img')?.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.initials')?.textContent?.trim()).toBe('TD');
  });
});
