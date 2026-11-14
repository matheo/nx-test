import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { MESSAGE_ERROR } from './message-error.const';
import type { ProductDto } from './product.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const product: ProductDto = {
  id: 'trj-crd',
  name: 'Tarjeta Credito',
  description: 'Tarjeta de consumo bajo modalidad credito',
  logo: 'https://example.com/logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(() => {
    controller = new ProductsController(new ProductsService());
  });

  it('returns an empty list wrapped in data', () => {
    expect(controller.getAll()).toEqual({ data: [] });
  });

  it('creates a product with the success message', () => {
    expect(controller.create(product)).toEqual({
      message: 'Product added successfully',
      data: product,
    });
    expect(controller.getAll()).toEqual({ data: [product] });
  });

  it('rejects a duplicate with the duplicate-identifier message', () => {
    controller.create(product);

    expect(() => controller.create(product)).toThrow(BadRequestException);
    expect(() => controller.create(product)).toThrow(MESSAGE_ERROR.DuplicateIdentifier);
  });

  it('verifies identifiers', () => {
    controller.create(product);

    expect(controller.verifyIdentifier('trj-crd')).toBe(true);
    expect(controller.verifyIdentifier('missing')).toBe(false);
  });

  it('gets one product and throws when missing', () => {
    controller.create(product);

    expect(controller.getOne('trj-crd')).toEqual(product);
    expect(() => controller.getOne('missing')).toThrow(NotFoundException);
  });

  it('updates a product with the success message', () => {
    controller.create(product);

    expect(controller.update('trj-crd', { name: 'Tarjeta Nueva' })).toEqual({
      message: 'Product updated successfully',
      data: { ...product, name: 'Tarjeta Nueva' },
    });
    expect(() => controller.update('missing', {})).toThrow(NotFoundException);
  });

  it('removes a product with the success message', () => {
    controller.create(product);

    expect(controller.remove('trj-crd')).toEqual({ message: 'Product removed successfully' });
    expect(() => controller.remove('trj-crd')).toThrow(MESSAGE_ERROR.NotFound);
  });
});
