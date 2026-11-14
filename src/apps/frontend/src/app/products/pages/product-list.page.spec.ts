import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductRepository } from '../api/product.repository';
import { makeProducts } from '../testing/make-products';
import { ProductListPage } from './product-list.page';

describe('ProductListPage', () => {
  async function render(count: number) {
    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [
        {
          provide: ProductRepository,
          useValue: { getAll: () => of(makeProducts(count)) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductListPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders one row per visible product and the total', async () => {
    const el = await render(8);
    expect(el.querySelectorAll('[data-testid="product-row"]')).toHaveLength(5);
    expect(el.textContent).toContain('8 Resultados');
  });

  it('formats dates as dd/mm/yyyy', async () => {
    const el = await render(1);
    expect(el.textContent).toContain('01/01/2024');
    expect(el.textContent).toContain('01/01/2025');
  });

  it('shows the empty state when there are no products', async () => {
    const el = await render(0);
    expect(el.textContent).toContain('No hay productos');
  });
});
