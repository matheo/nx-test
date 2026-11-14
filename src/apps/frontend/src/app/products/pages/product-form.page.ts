import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ProductInterface } from '@bank/models';
import { UiButton, UiFormField } from '@bank/ui';
import { ProductRepository } from '../api/product.repository';
import {
  addOneYear,
  idAvailable,
  revisionOneYearAfter,
  todayOrLater,
} from '../forms/product-validators';
import { TODAY } from '../forms/today';

type FieldName = keyof ProductInterface;

const SAVE_ERROR = 'No se pudo guardar el producto.';
const LOAD_ERROR = 'No se pudo cargar el producto.';

@Component({
  selector: 'app-product-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiButton, UiFormField],
  templateUrl: './product-form.page.html',
  styleUrl: './product-form.page.scss',
})
export class ProductFormPage {
  private readonly repository = inject(ProductRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly today = inject(TODAY);

  /** Bound from the `edit/:id` route (withComponentInputBinding). */
  readonly id = input<string>();
  protected readonly isEdit = computed(() => !!this.id());

  /** Product loaded in edit mode; used by Reiniciar and the date validator. */
  private original: ProductInterface | null = null;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      id: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        [idAvailable(this.repository)],
      ],
      name: [
        '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      logo: ['', Validators.required],
      date_release: [
        '',
        [
          Validators.required,
          todayOrLater(this.today, () => this.original?.date_release ?? null),
        ],
      ],
      date_revision: [{ value: '', disabled: true }, Validators.required],
    },
    { validators: revisionOneYearAfter },
  );

  protected readonly saving = signal(false);
  protected readonly serverError = signal<string | null>(null);

  /** Re-evaluates the template on validity changes (including async ones). */
  private readonly status = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        untracked(() => this.load(id));
      }
    });
    this.form.controls.date_release.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((release) =>
        this.form.controls.date_revision.setValue(addOneYear(release ?? '')),
      );
  }

  protected canSubmit(): boolean {
    const status = this.status();
    return status === 'VALID' && !this.saving();
  }

  protected errorFor(name: FieldName): string | null {
    this.status();
    const control = this.form.get(name);
    if (!control || !(control.touched || control.dirty)) {
      return null;
    }
    return this.messageFor(name, control);
  }

  protected reset(): void {
    if (this.original) {
      this.applyProduct(this.original);
    } else {
      this.form.reset();
    }
    this.serverError.set(null);
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.serverError.set(null);
    const value = this.form.getRawValue();
    const id = this.id();
    const request = id
      ? this.repository.update(id, value)
      : this.repository.create(value);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.serverError.set(this.serverMessage(err));
      },
    });
  }

  private load(id: string): void {
    this.serverError.set(null);
    this.repository
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.original = product;
          this.applyProduct(product);
        },
        error: () => this.serverError.set(LOAD_ERROR),
      });
  }

  /** Fills the form with a product and keeps the id locked (edit mode). */
  private applyProduct(product: ProductInterface): void {
    this.form.reset(product);
    this.form.controls.id.disable();
  }

  private messageFor(name: FieldName, control: AbstractControl): string | null {
    const errors = control.errors ?? {};
    if (errors['required']) {
      return 'Este campo es requerido!';
    }
    if (errors['idTaken']) {
      return 'ID no válido! Ya existe';
    }
    if (name === 'id' && (errors['minlength'] || errors['maxlength'])) {
      return 'ID no válido!';
    }
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['minDate']) {
      return 'La fecha debe ser igual o mayor a hoy';
    }
    if (name === 'date_revision' && this.form.errors?.['revision']) {
      return 'Debe ser un año posterior a la fecha de liberación';
    }
    return null;
  }

  private serverMessage(err: unknown): string {
    const message =
      err instanceof HttpErrorResponse
        ? (err.error as { message?: string | string[] } | null)?.message
        : undefined;
    if (Array.isArray(message) && message.length) {
      return message.join(', ');
    }
    return typeof message === 'string' && message ? message : SAVE_ERROR;
  }
}
