import { ProductInterface } from '@bank/models';
import { Observable } from 'rxjs';

/** Port for product data access. Also used as the DI token. */
export abstract class ProductRepository {
  abstract getAll(): Observable<ProductInterface[]>;
  abstract create(product: ProductInterface): Observable<ProductInterface>;
  abstract getById(id: string): Observable<ProductInterface>;
  abstract update(
    id: string,
    product: ProductInterface,
  ): Observable<ProductInterface>;
  abstract remove(id: string): Observable<void>;
  /** Emits true when a product with this id already exists. */
  abstract exists(id: string): Observable<boolean>;
}
