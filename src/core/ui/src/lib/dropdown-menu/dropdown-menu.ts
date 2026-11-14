import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Kebab-icon trigger that opens a menu panel with the projected items
 * (`a` / `button` with `role="menuitem"`).
 * The panel uses `position: fixed` so scrollable ancestors (e.g. the table
 * card with `overflow-x: auto`) do not clip it. Uses no encapsulation so the
 * projected items can be styled; every selector is scoped under
 * `ui-dropdown-menu`.
 */
@Component({
  selector: 'ui-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      #trigger
      type="button"
      class="ui-dropdown-menu__trigger"
      aria-haspopup="menu"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="label()"
      (click)="toggle()"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </button>
    @if (open()) {
      <div
        class="ui-dropdown-menu__panel"
        role="menu"
        [style.top.px]="top()"
        [style.right.px]="right()"
      >
        <ng-content />
      </div>
    }
  `,
  styles: `
    ui-dropdown-menu {
      display: inline-block;
    }
    ui-dropdown-menu .ui-dropdown-menu__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--ui-space-1);
      border: 0;
      border-radius: var(--ui-radius-sm);
      background: transparent;
      color: var(--ui-color-text-muted);
      cursor: pointer;
    }
    ui-dropdown-menu .ui-dropdown-menu__trigger:hover {
      color: var(--ui-color-text);
    }
    ui-dropdown-menu .ui-dropdown-menu__trigger:focus-visible {
      outline: 2px solid var(--ui-color-focus);
      outline-offset: 1px;
    }
    ui-dropdown-menu .ui-dropdown-menu__panel {
      position: fixed;
      z-index: var(--ui-z-dropdown);
      display: flex;
      flex-direction: column;
      min-width: 140px;
      padding: var(--ui-space-1) 0;
      border: 1px solid var(--ui-color-border);
      border-radius: var(--ui-radius-sm);
      background: var(--ui-color-surface);
      box-shadow: var(--ui-shadow-md);
    }
    ui-dropdown-menu [role='menuitem'] {
      display: block;
      padding: var(--ui-space-2) var(--ui-space-4);
      border: 0;
      background: transparent;
      color: var(--ui-color-text);
      font: inherit;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    ui-dropdown-menu [role='menuitem']:hover,
    ui-dropdown-menu [role='menuitem']:focus-visible {
      background: var(--ui-color-page-bg);
      outline: none;
    }
  `,
})
export class UiDropdownMenu {
  /** Accessible name of the trigger, e.g. "Acciones de Producto 1". */
  readonly label = input.required<string>();

  protected readonly open = signal(false);
  protected readonly top = signal(0);
  protected readonly right = signal(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  constructor() {
    // Listen only while the menu is open, so closed rows cost nothing.
    const document = inject(DOCUMENT);
    effect((onCleanup) => {
      if (!this.open()) {
        return;
      }
      const onClick = (event: Event) => this.onDocumentClick(event);
      const onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.onEscape();
        }
      };
      const onDismiss = () => this.close();
      document.addEventListener('click', onClick);
      document.addEventListener('keydown', onKeydown);
      window.addEventListener('resize', onDismiss);
      // `scroll` does not bubble: listen in the capture phase so scrolling any
      // ancestor (e.g. the table card) closes the fixed-position panel.
      document.addEventListener('scroll', onDismiss, {
        capture: true,
        passive: true,
      });
      onCleanup(() => {
        document.removeEventListener('click', onClick);
        document.removeEventListener('keydown', onKeydown);
        window.removeEventListener('resize', onDismiss);
        document.removeEventListener('scroll', onDismiss, { capture: true });
      });
    });
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    this.top.set(rect.bottom);
    this.right.set(window.innerWidth - rect.right);
    this.open.set(true);
  }

  protected close(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }

  protected onEscape(): void {
    if (this.open()) {
      this.close();
      this.trigger().nativeElement.focus();
    }
  }

  protected onDocumentClick(event: Event): void {
    const target = event.target as Element;
    const outside = !this.host.nativeElement.contains(target);
    if (outside || target.closest('[role="menuitem"]')) {
      this.close();
    }
  }
}
