import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  withComponentInputBinding,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { makeProducts, stubDialogApi } from '@bank/testing';
import { of, throwError } from 'rxjs';
import { ProductRepository } from '../api/product.repository';
import { FakeProductRepository } from '../testing/fake-product.repository';
import { ProductListPage } from './product-list.page';

describe('ProductListPage', () => {
  beforeAll(stubDialogApi);

  let repository: FakeProductRepository;

  async function render(count: number, url = '/') {
    repository = new FakeProductRepository();
    repository.getAll.mockReturnValue(of(makeProducts(count)));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: '', component: ProductListPage }],
          withComponentInputBinding(),
        ),
        {
          provide: ProductRepository,
          useValue: repository,
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
    (
      el.querySelector('[aria-label="Página siguiente"]') as HTMLButtonElement
    ).click();
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

  describe('deleting', () => {
    const wait = () => new Promise((r) => setTimeout(r));
    const dialog = (el: HTMLElement) =>
      el.querySelector('dialog') as HTMLDialogElement;
    const dialogButton = (el: HTMLElement, label: string) =>
      Array.from(dialog(el).querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === label,
      ) as HTMLButtonElement;

    async function openDialog(el: HTMLElement, name = 'Product 0') {
      (
        el.querySelector(
          `button[aria-label="Acciones de ${name}"]`,
        ) as HTMLButtonElement
      ).click();
      await wait();
      const item = Array.from(el.querySelectorAll('[role="menuitem"]')).find(
        (i) => i.textContent?.includes('Eliminar'),
      ) as HTMLButtonElement;
      item.click();
      await wait();
    }

    it('opens the confirm dialog with the product name', async () => {
      const el = await render(2);
      expect(dialog(el).open).toBe(false);
      await openDialog(el);
      expect(dialog(el).open).toBe(true);
      expect(dialog(el).textContent).toContain(
        '¿Estas seguro de eliminar el producto Product 0?',
      );
    });

    it('closes without removing when Cancelar is clicked', async () => {
      const el = await render(2);
      await openDialog(el);
      dialogButton(el, 'Cancelar').click();
      await wait();
      expect(dialog(el).open).toBe(false);
      expect(repository.remove).not.toHaveBeenCalled();
      expect(rows(el)).toHaveLength(2);
    });

    it('removes the row and closes the dialog when Confirmar is clicked', async () => {
      const el = await render(2);
      await openDialog(el);
      dialogButton(el, 'Confirmar').click();
      await wait();
      expect(repository.remove).toHaveBeenCalledWith('id-0');
      expect(rows(el)).toHaveLength(1);
      expect(el.textContent).toContain('1 Resultados');
      expect(dialog(el).open).toBe(false);
    });

    it('keeps the dialog open and shows an error when removal fails', async () => {
      const el = await render(2);
      repository.remove.mockReturnValue(throwError(() => new Error('boom')));
      await openDialog(el);
      dialogButton(el, 'Confirmar').click();
      await wait();
      expect(dialog(el).open).toBe(true);
      expect(dialog(el).querySelector('[role="alert"]')?.textContent).toContain(
        'No se pudo eliminar el producto.',
      );
      expect(rows(el)).toHaveLength(2);
    });
  });
});
