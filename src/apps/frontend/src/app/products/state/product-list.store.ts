import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductInterface } from '@bank/models';
import { Observable, tap } from 'rxjs';
import { ProductRepository } from '../api/product.repository';

export type PageSize = 5 | 10 | 20;

export const PAGE_SIZES: readonly PageSize[] = [5, 10, 20];

@Injectable()
export class ProductListStore {
  private readonly repository = inject(ProductRepository);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<ProductInterface[]>([]);
  readonly query = signal('');
  readonly pageSize = signal<PageSize>(5);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) {
      return this.products();
    }
    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term),
    );
  });

  readonly total = computed(() => this.filtered().length);

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  /** Current page (1-based); resets to 1 whenever the search or page size changes. */
  readonly page = linkedSignal({
    source: () => [this.query(), this.pageSize()] as const,
    computation: () => 1,
  });

  readonly visible = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  next(): void {
    this.page.update((page) => Math.min(page + 1, this.pageCount()));
  }

  prev(): void {
    this.page.update((page) => Math.max(page - 1, 1));
  }

  /** Deletes a product and drops it from the list. The caller subscribes. */
  remove(id: string): Observable<void> {
    return this.repository.remove(id).pipe(
      tap(() => {
        this.products.update((products) =>
          products.filter((product) => product.id !== id),
        );
        this.page.update((page) => Math.min(page, this.pageCount()));
      }),
    );
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los productos.');
          this.loading.set(false);
        },
      });
  }
}
