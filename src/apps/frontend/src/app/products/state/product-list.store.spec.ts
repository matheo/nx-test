import { TestBed } from '@angular/core/testing';
import { ProductInterface } from '@bank/models';
import { Observable, of, throwError } from 'rxjs';
import { ProductRepository } from '../api/product.repository';
import { makeProducts } from '../testing/make-products';
import { ProductListStore } from './product-list.store';

class FakeRepository extends ProductRepository {
  result: Observable<ProductInterface[]> = of([]);
  getAll() {
    return this.result;
  }
}

describe('ProductListStore', () => {
  let repository: FakeRepository;
  let store: ProductListStore;

  beforeEach(() => {
    repository = new FakeRepository();
    TestBed.configureTestingModule({
      providers: [
        ProductListStore,
        { provide: ProductRepository, useValue: repository },
      ],
    });
    store = TestBed.inject(ProductListStore);
  });

  it('loads products and clears loading', () => {
    repository.result = of(makeProducts(12));
    store.load();
    expect(store.loading()).toBe(false);
    expect(store.total()).toBe(12);
  });

  it('shows only pageSize rows (default 5) and follows page size changes', () => {
    repository.result = of(makeProducts(12));
    store.load();
    expect(store.visible()).toHaveLength(5);
    store.pageSize.set(10);
    expect(store.visible()).toHaveLength(10);
    store.pageSize.set(20);
    expect(store.visible()).toHaveLength(12);
  });

  it('pages through the filtered results and clamps at the ends', () => {
    repository.result = of(makeProducts(12));
    store.load();
    expect(store.pageCount()).toBe(3);
    store.prev();
    expect(store.page()).toBe(1);
    store.next();
    store.next();
    store.next();
    expect(store.page()).toBe(3);
    expect(store.visible().map((p) => p.id)).toEqual(['id-10', 'id-11']);
    expect(store.total()).toBe(12);
  });

  it('resets to the first page when the query or page size changes', () => {
    repository.result = of(makeProducts(12));
    store.load();
    store.next();
    store.query.set('product');
    expect(store.page()).toBe(1);
    store.next();
    store.pageSize.set(10);
    expect(store.page()).toBe(1);
  });

  it('filters by name or description, case-insensitive and trimmed', () => {
    const products = makeProducts(3);
    products[0].name = 'Visa Gold';
    products[1].description = 'Cuenta de AHORRO';
    repository.result = of(products);
    store.load();
    store.query.set('  visa ');
    expect(store.filtered().map((p) => p.id)).toEqual(['id-0']);
    store.query.set('ahorro');
    expect(store.filtered().map((p) => p.id)).toEqual(['id-1']);
    expect(store.total()).toBe(1);
  });

  it('exposes an error message when loading fails', () => {
    repository.result = throwError(() => new Error('boom'));
    store.load();
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });
});
