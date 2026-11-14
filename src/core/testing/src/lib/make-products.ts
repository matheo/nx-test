import { ProductInterface } from '@bank/models';

export function makeProducts(count: number): ProductInterface[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    name: `Product ${i}`,
    description: `Description ${i}`,
    logo: '',
    date_release: '2024-01-01',
    date_revision: '2025-01-01',
  }));
}
