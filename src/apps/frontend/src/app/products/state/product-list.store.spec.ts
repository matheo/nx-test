import { TestBed } from '@angular/core/testing';
import { makeProducts } from '@bank/testing';
import { of, throwError } from 'rxjs';
import { ProductRepository } from '../api/product.repository';
import { FakeProductRepository } from '../testing/fake-product.repository';
import { ProductListStore } from './product-list.store';

describe('ProductListStore', () => {
  let repository: FakeProductRepository;
  let store: ProductListStore;

  beforeEach(() => {
    repository = new FakeProductRepository();
    TestBed.configureTestingModule({
      providers: [
        ProductListStore,
        { provide: ProductRepository, useValue: repository },
      ],
    });
    store = TestBed.inject(ProductListStore);
  });

  it('loads products and clears loading', () => {
    repository.getAll.mockReturnValue(of(makeProducts(12)));
    store.load();
    expect(store.loading()).toBe(false);
    expect(store.total()).toBe(12);
  });

  it('shows only pageSize rows (default 5) and follows page size changes', () => {
    repository.getAll.mockReturnValue(of(makeProducts(12)));
    store.load();
    expect(store.visible()).toHaveLength(5);
    store.pageSize.set(10);
    expect(store.visible()).toHaveLength(10);
    store.pageSize.set(20);
    expect(store.visible()).toHaveLength(12);
  });

  it('pages through the filtered results and clamps at the ends', () => {
    repository.getAll.mockReturnValue(of(makeProducts(12)));
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
    repository.getAll.mockReturnValue(of(makeProducts(12)));
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
    repository.getAll.mockReturnValue(of(products));
    store.load();
    store.query.set('  visa ');
    expect(store.filtered().map((p) => p.id)).toEqual(['id-0']);
    store.query.set('ahorro');
    expect(store.filtered().map((p) => p.id)).toEqual(['id-1']);
    expect(store.total()).toBe(1);
  });

  it('removes a product from the list after the repository succeeds', () => {
    repository.getAll.mockReturnValue(of(makeProducts(3)));
    store.load();
    store.remove('id-1').subscribe();
    expect(store.products().map((p) => p.id)).toEqual(['id-0', 'id-2']);
    expect(store.total()).toBe(2);
  });

  it('keeps the list and surfaces the error when removal fails', () => {
    repository.getAll.mockReturnValue(of(makeProducts(3)));
    store.load();
    repository.remove.mockReturnValue(throwError(() => new Error('boom')));
    const error = vi.fn();
    store.remove('id-1').subscribe({ error });
    expect(error).toHaveBeenCalled();
    expect(store.total()).toBe(3);
  });

  it('moves to the previous page when the last row of the last page is removed', () => {
    repository.getAll.mockReturnValue(of(makeProducts(6)));
    store.load();
    store.next();
    expect(store.page()).toBe(2);
    store.remove('id-5').subscribe();
    expect(store.page()).toBe(1);
    expect(store.visible()).toHaveLength(5);
  });

  it('exposes an error message when loading fails', () => {
    repository.getAll.mockReturnValue(throwError(() => new Error('boom')));
    store.load();
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });
});
