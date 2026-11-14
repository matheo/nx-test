import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductRepository } from '../api/product.repository';
import { makeProducts } from '../testing/make-products';
import { ProductListPage } from './product-list.page';

describe('ProductListPage', () => {
  async function render(count: number, url = '/') {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: '', component: ProductListPage }],
          withComponentInputBinding(),
        ),
        {
          provide: ProductRepository,
          useValue: { getAll: () => of(makeProducts(count)) },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, ProductListPage);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  const rows = (el: HTMLElement) =>
    el.querySelectorAll('[data-testid="product-row"]');

  it('renders one row per visible product and the total', async () => {
    const el = await render(8);
    expect(rows(el)).toHaveLength(5);
    expect(el.textContent).toContain('8 Resultados');
  });

  it('navigates to the next page keeping the total', async () => {
    const el = await render(8);
    (el.querySelector('[aria-label="Página siguiente"]') as HTMLButtonElement).click();
    await new Promise((r) => setTimeout(r));
    expect(rows(el)).toHaveLength(3);
    expect(el.textContent).toContain('8 Resultados');
    expect(el.textContent).toContain('Página 2 de 2');
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

  it('filters by the ?search= query param', async () => {
    const el = await render(8, '/?search=product%203');
    expect(rows(el)).toHaveLength(1);
    expect(el.textContent).toContain('1 Resultados');
    expect(el.querySelector('input')?.value).toBe('product 3');
  });

  it('writes the search term to the URL and clears it when empty', async () => {
    const el = await render(8);
    const router = TestBed.inject(Router);
    const input = el.querySelector('input') as HTMLInputElement;

    input.value = 'Product 2';
    input.dispatchEvent(new Event('input'));
    await TestBed.inject(Router).navigated;
    await new Promise((r) => setTimeout(r));
    expect(router.url).toBe('/?search=Product%202');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r));
    expect(router.url).toBe('/');
  });

  it('opens the row menu with an Editar link to /edit/<id>', async () => {
    const el = await render(1);
    const trigger = el.querySelector(
      'button[aria-label="Acciones de Product 0"]',
    ) as HTMLButtonElement;
    trigger.click();
    await new Promise((r) => setTimeout(r));
    const link = el.querySelector('[role="menuitem"]');
    expect(link?.textContent).toContain('Editar');
    expect(link?.getAttribute('href')).toBe('/edit/id-0');
  });

  it('links the Agregar button to /new', async () => {
    const el = await render(1);
    const link = Array.from(el.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Agregar'),
    );
    expect(link?.getAttribute('href')).toBe('/new');
  });
});
