import { ProductInterface } from '@bank/models';
import { makeProducts } from '@bank/testing';
import { of } from 'rxjs';
import { ProductRepository } from '../api/product.repository';

/**
 * Test double for the product port. Every method is a `vi.fn` with a
 * harmless default; specs override only what they need through
 * `mockReturnValue` / `mockImplementation`.
 */
export class FakeProductRepository extends ProductRepository {
  override getAll = vi.fn<ProductRepository['getAll']>(() => of([]));
  override create = vi.fn<ProductRepository['create']>((product) =>
    of(product),
  );
  override getById = vi.fn<ProductRepository['getById']>((id) =>
    of({ ...makeProducts(1)[0], id } satisfies ProductInterface),
  );
  override update = vi.fn<ProductRepository['update']>((_id, product) =>
    of(product),
  );
  override remove = vi.fn<ProductRepository['remove']>(() => of(undefined));
  override exists = vi.fn<ProductRepository['exists']>(() => of(false));
}
