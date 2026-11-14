import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { ProductInterface } from '@bank/models';
import { MESSAGE_ERROR } from './message-error.const';

@Injectable()
export class ProductsService {
  private products: ProductInterface[] = [];

  findAll(): ProductInterface[] {
    return [...this.products];
  }

  exists(id: string): boolean {
    return this.products.some((product) => product.id === id);
  }

  findOne(id: string): ProductInterface {
    return this.products[this.indexOrThrow(id)];
  }

  create(product: ProductInterface): ProductInterface {
    if (this.exists(product.id)) {
      throw new BadRequestException(MESSAGE_ERROR.DuplicateIdentifier);
    }
    this.products.push(product);
    return product;
  }

  update(id: string, changes: Partial<ProductInterface>): ProductInterface {
    const index = this.indexOrThrow(id);
    this.products[index] = { ...this.products[index], ...changes };
    return this.products[index];
  }

  remove(id: string): void {
    this.indexOrThrow(id);
    this.products = this.products.filter((product) => product.id !== id);
  }

  private indexOrThrow(id: string): number {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) {
      throw new NotFoundException(MESSAGE_ERROR.NotFound);
    }
    return index;
  }
}
