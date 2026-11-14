import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'ui-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showImage()) {
      <img
        class="image"
        [src]="src()"
        [alt]="name()"
        (error)="failed.set(true)"
      />
    } @else {
      <span class="initials" role="img" [attr.aria-label]="name()">{{
        initials()
      }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .image,
    .initials {
      box-sizing: border-box;
      width: 40px;
      height: 40px;
      border-radius: var(--ui-radius-full);
    }
    .image {
      object-fit: cover;
    }
    .initials {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--ui-color-avatar-bg);
      color: var(--ui-color-text);
      font-size: var(--ui-font-size-sm);
      font-weight: 600;
    }
  `,
})
export class UiAvatar {
  readonly src = input<string | null | undefined>('');
  readonly name = input('');

  protected readonly failed = signal(false);

  protected readonly showImage = computed(
    () => !!this.src()?.trim() && !this.failed(),
  );

  protected readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join(''),
  );

  constructor() {
    // A new source gets a fresh chance to load.
    effect(() => {
      this.src();
      this.failed.set(false);
    });
  }
}
