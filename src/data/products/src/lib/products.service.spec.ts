import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ProductInterface } from '@bank/models';
import { beforeEach, describe, expect, it } from 'vitest';
import { MESSAGE_ERROR } from './message-error.const';
import { ProductsService } from './products.service';

const buildProduct = (overrides: Partial<ProductInterface> = {}): ProductInterface => ({
  id: 'trj-crd',
  name: 'Tarjeta Credito',
  description: 'Tarjeta de consumo bajo modalidad credito',
  logo: 'https://example.com/logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
  ...overrides,
});

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('starts empty', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('creates a product and returns it', () => {
    const product = buildProduct();

    expect(service.create(product)).toEqual(product);
    expect(service.findAll()).toEqual([product]);
  });

  it('rejects a duplicate identifier with BadRequestException', () => {
    service.create(buildProduct());

    expect(() => service.create(buildProduct())).toThrow(BadRequestException);
    expect(() => service.create(buildProduct())).toThrow(MESSAGE_ERROR.DuplicateIdentifier);
  });

  it('reports whether an identifier exists', () => {
    service.create(buildProduct());

    expect(service.exists('trj-crd')).toBe(true);
    expect(service.exists('missing')).toBe(false);
  });

  it('finds a product by id', () => {
    const product = buildProduct();
    service.create(product);

    expect(service.findOne('trj-crd')).toEqual(product);
  });

  it('throws NotFoundException when finding a missing product', () => {
    expect(() => service.findOne('missing')).toThrow(NotFoundException);
    expect(() => service.findOne('missing')).toThrow(MESSAGE_ERROR.NotFound);
  });

  it('merges changes into an existing product on update', () => {
    service.create(buildProduct());

    const updated = service.update('trj-crd', { name: 'Tarjeta Nueva' });

    expect(updated).toEqual(buildProduct({ name: 'Tarjeta Nueva' }));
    expect(service.findOne('trj-crd')).toEqual(updated);
  });

  it('throws NotFoundException when updating a missing product', () => {
    expect(() => service.update('missing', { name: 'Whatever' })).toThrow(NotFoundException);
    expect(() => service.update('missing', { name: 'Whatever' })).toThrow(MESSAGE_ERROR.NotFound);
  });

  it('removes a product', () => {
    service.create(buildProduct());
    service.create(buildProduct({ id: 'other' }));

    service.remove('trj-crd');

    expect(service.exists('trj-crd')).toBe(false);
    expect(service.findAll()).toHaveLength(1);
  });

  it('throws NotFoundException when removing a missing product', () => {
    expect(() => service.remove('missing')).toThrow(NotFoundException);
    expect(() => service.remove('missing')).toThrow(MESSAGE_ERROR.NotFound);
  });

  it('does not expose internal state through findAll', () => {
    service.create(buildProduct());

    service.findAll().pop();

    expect(service.findAll()).toHaveLength(1);
  });
});
