import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';
import { ProductRepository } from '../api/product.repository';

/** Same day one year later; Feb 29 becomes Feb 28. Dates are `yyyy-mm-dd`. */
export function addOneYear(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return '';
  }
  const [, year, month, day] = match;
  const nextYear = String(Number(year) + 1).padStart(4, '0');
  const adjustedDay = month === '02' && day === '29' ? '28' : day;
  return `${nextYear}-${month}-${adjustedDay}`;
}

/**
 * Fails with `{minDate}` when the value is before today (string compare).
 * A value equal to `unchanged()` (e.g. the original date of a product being
 * edited) is always valid.
 */
export function todayOrLater(
  today: () => string,
  unchanged: () => string | null = () => null,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value || value === unchanged()) {
      return null;
    }
    return value < today() ? { minDate: true } : null;
  };
}

/** Group validator: `date_revision` must be `date_release` + 1 year. */
export const revisionOneYearAfter: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const release = group.get('date_release')?.value as string | undefined;
  const revision = group.get('date_revision')?.value as string | undefined;
  if (!release || !revision) {
    return null;
  }
  return revision === addOneYear(release) ? null : { revision: true };
};

/** Async: `{idTaken}` when the id exists. Request failures pass (POST is the backstop). */
export function idAvailable(
  repository: ProductRepository,
  debounceMs = 300,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const id = control.value as string;
    if (!id) {
      return of(null);
    }
    return timer(debounceMs).pipe(
      switchMap(() => repository.exists(id)),
      map((exists) => (exists ? { idTaken: true } : null)),
      catchError(() => of(null)),
    );
  };
}
