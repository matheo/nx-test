import { ProductInterface } from '@bank/models';
import { Observable } from 'rxjs';

/** Port for product data access. Also used as the DI token. */
export abstract class ProductRepository {
  abstract getAll(): Observable<ProductInterface[]>;
}
