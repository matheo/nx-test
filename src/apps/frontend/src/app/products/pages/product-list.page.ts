import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ProductInterface } from '@bank/models';
import {
  DisplayDatePipe,
  UiAvatar,
  UiButton,
  UiConfirmDialog,
  UiDropdownMenu,
  UiInfoHint,
  UiPagination,
  UiSearchInput,
  UiSelect,
  UiSelectOption,
  UiTableCard,
} from '@bank/ui';
import {
  PAGE_SIZES,
  PageSize,
  ProductListStore,
} from '../state/product-list.store';

@Component({
  selector: 'app-product-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DisplayDatePipe,
    RouterLink,
    UiAvatar,
    UiButton,
    UiConfirmDialog,
    UiDropdownMenu,
    UiInfoHint,
    UiPagination,
    UiSearchInput,
    UiSelect,
    UiTableCard,
  ],
  providers: [ProductListStore],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
})
export class ProductListPage implements OnInit {
  protected readonly store = inject(ProductListStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Bound from the `?search=` query param (withComponentInputBinding). */
  readonly search = input<string | undefined>();

  protected readonly pageSizeOptions: readonly UiSelectOption<PageSize>[] =
    PAGE_SIZES.map((size) => ({ label: String(size), value: size }));

  protected readonly pendingDelete = signal<ProductInterface | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  constructor() {
    effect(() => this.store.query.set(this.search() ?? ''));
  }

  ngOnInit(): void {
    this.store.load();
  }

  protected askDelete(product: ProductInterface): void {
    this.deleteError.set(null);
    this.pendingDelete.set(product);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
    this.deleteError.set(null);
  }

  protected confirmDelete(): void {
    const product = this.pendingDelete();
    if (!product || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    this.deleteError.set(null);
    this.store
      .remove(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.pendingDelete.set(null);
          this.deleting.set(false);
        },
        error: () => {
          this.deleteError.set('No se pudo eliminar el producto.');
          this.deleting.set(false);
        },
      });
  }

  protected onSearchChange(term: string): void {
    this.router.navigate([], {
      queryParams: { search: term.trim() ? term : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onPageSizeChange(size: PageSize | undefined): void {
    if (size) {
      this.store.pageSize.set(size);
    }
  }
}
