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

  create(product: ProductInterface): Observable<ProductInterface> {
    return this.http
      .post<{ data: ProductInterface }>('/backend/products', product)
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<ProductInterface> {
    return this.http.get<ProductInterface>(
      `/backend/products/${encodeURIComponent(id)}`,
    );
  }

  update(id: string, product: ProductInterface): Observable<ProductInterface> {
    return this.http
      .put<{ data: ProductInterface }>(
        `/backend/products/${encodeURIComponent(id)}`,
        product,
      )
      .pipe(map((response) => response.data));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete(`/backend/products/${encodeURIComponent(id)}`)
      .pipe(map(() => undefined));
  }

  exists(id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `/backend/products/verification/${encodeURIComponent(id)}`,
    );
  }
}
