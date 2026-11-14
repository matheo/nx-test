import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { ProductInterface } from '@bank/models';
import { ProductRepository } from '../api/product.repository';
import { TODAY } from '../forms/today';
import { ProductFormPage } from './product-form.page';

describe('ProductFormPage', () => {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function render(
    options: {
      exists?: boolean;
      create?: (p: ProductInterface) => Observable<ProductInterface>;
    } = {},
  ) {
    const create = vi.fn(
      options.create ?? ((p: ProductInterface) => of(p)),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', children: [] },
          { path: 'new', component: ProductFormPage },
        ]),
        { provide: TODAY, useValue: () => '2026-11-14' },
        {
          provide: ProductRepository,
          useValue: { exists: () => of(options.exists ?? false), create },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/new', ProductFormPage);
    harness.detectChanges();
    const el = harness.routeNativeElement as HTMLElement;
    return { harness, el, create };
  }

  const field = (el: HTMLElement, id: string) =>
    el.querySelector(`#${id}`) as HTMLInputElement;
  const submitBtn = (el: HTMLElement) =>
    el.querySelector('button[type="submit"]') as HTMLButtonElement;

  function type(
    harness: RouterTestingHarness,
    el: HTMLElement,
    id: string,
    value: string,
  ) {
    const input = field(el, id);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
  }

  async function fillValid(harness: RouterTestingHarness, el: HTMLElement) {
    type(harness, el, 'product-id', 'trj-crd');
    type(harness, el, 'product-name', 'Tarjeta Crédito');
    type(harness, el, 'product-description', 'Tarjeta de consumo bajo');
    type(harness, el, 'product-logo', 'https://logo.png');
    type(harness, el, 'product-release', '2026-12-01');
    await wait(400);
    harness.detectChanges();
  }

  it('starts with the submit button disabled', async () => {
    const { el } = await render();
    expect(el.textContent).toContain('Formulario de Registro');
    expect(submitBtn(el).disabled).toBe(true);
  });

  it('shows errors on blur for short id and name', async () => {
    const { harness, el } = await render();
    type(harness, el, 'product-id', 'ab');
    type(harness, el, 'product-name', 'abc');
    field(el, 'product-id').dispatchEvent(new Event('blur'));
    field(el, 'product-name').dispatchEvent(new Event('blur'));
    harness.detectChanges();
    expect(el.textContent).toContain('ID no válido!');
    expect(el.textContent).toContain('Mínimo 5 caracteres');
  });

  it('shows required on a touched empty field', async () => {
    const { harness, el } = await render();
    field(el, 'product-logo').dispatchEvent(new Event('blur'));
    harness.detectChanges();
    expect(el.textContent).toContain('Este campo es requerido!');
  });

  it('flags an id that already exists', async () => {
    const { harness, el } = await render({ exists: true });
    type(harness, el, 'product-id', 'trj-crd');
    await wait(400);
    harness.detectChanges();
    expect(el.textContent).toContain('ID no válido! Ya existe');
  });

  it('fills the revision date one year after release', async () => {
    const { harness, el } = await render();
    type(harness, el, 'product-release', '2026-12-01');
    expect(field(el, 'product-revision').value).toBe('2027-12-01');
    expect(field(el, 'product-revision').disabled).toBe(true);
  });

  it('rejects a past release date', async () => {
    const { harness, el } = await render();
    type(harness, el, 'product-release', '2026-11-13');
    expect(el.textContent).toContain('La fecha debe ser igual o mayor a hoy');
  });

  it('creates the product with the raw value and navigates to the list', async () => {
    const { harness, el, create } = await render();
    await fillValid(harness, el);
    expect(submitBtn(el).disabled).toBe(false);

    submitBtn(el).click();
    await harness.fixture.whenStable();
    expect(create).toHaveBeenCalledWith({
      id: 'trj-crd',
      name: 'Tarjeta Crédito',
      description: 'Tarjeta de consumo bajo',
      logo: 'https://logo.png',
      date_release: '2026-12-01',
      date_revision: '2027-12-01',
    });
    await wait(0);
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('clears the form with Reiniciar', async () => {
    const { harness, el } = await render();
    await fillValid(harness, el);
    const reset = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reiniciar'),
    ) as HTMLButtonElement;
    reset.click();
    harness.detectChanges();
    for (const id of [
      'product-id',
      'product-name',
      'product-description',
      'product-logo',
      'product-release',
      'product-revision',
    ]) {
      expect(field(el, id).value).toBe('');
    }
    expect(submitBtn(el).disabled).toBe(true);
  });

  it('shows the backend error message and stays on the page', async () => {
    const { harness, el } = await render({
      create: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { message: 'Duplicate identifier found in the database' },
            }),
        ),
    });
    await fillValid(harness, el);
    submitBtn(el).click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(el.textContent).toContain(
      'Duplicate identifier found in the database',
    );
    expect(TestBed.inject(Router).url).toBe('/new');
  });
});
