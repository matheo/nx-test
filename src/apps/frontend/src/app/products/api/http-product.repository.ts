import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProductInterface } from '@bank/models';
import { map, Observable } from 'rxjs';
import { ProductRepository } from './product.repository';

@Injectable()
export class HttpProductRepository extends ProductRepository {
  private readonly http = inject(HttpClient);

  getAll(): Observable<ProductInterface[]> {
    return this.http
      .get<{ data: ProductInterface[] }>('/backend/products')
      .pipe(map((response) => response.data ?? []));
  }
}
