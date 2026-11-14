import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductInterface } from '@bank/models';
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

  readonly visible = computed(() => this.filtered().slice(0, this.pageSize()));

  readonly total = computed(() => this.filtered().length);

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
