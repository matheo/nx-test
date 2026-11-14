import { FormControl, FormGroup } from '@angular/forms';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { FakeProductRepository } from '../testing/fake-product.repository';
import {
  addOneYear,
  idAvailable,
  revisionOneYearAfter,
  todayOrLater,
} from './product-validators';

describe('addOneYear', () => {
  it('adds one year keeping month and day', () => {
    expect(addOneYear('2026-11-14')).toBe('2027-11-14');
  });

  it('maps Feb 29 to Feb 28', () => {
    expect(addOneYear('2024-02-29')).toBe('2025-02-28');
  });

  it('returns empty for invalid input', () => {
    expect(addOneYear('')).toBe('');
    expect(addOneYear('nope')).toBe('');
  });
});

describe('todayOrLater', () => {
  const validate = todayOrLater(() => '2026-11-14');
  const run = (value: string) => validate(new FormControl(value));

  it('accepts today and future dates', () => {
    expect(run('2026-11-14')).toBeNull();
    expect(run('2026-11-15')).toBeNull();
    expect(run('2027-01-01')).toBeNull();
  });

  it('rejects yesterday and earlier', () => {
    expect(run('2026-11-13')).toEqual({ minDate: true });
    expect(run('2025-12-31')).toEqual({ minDate: true });
  });

  it('ignores empty values (required handles them)', () => {
    expect(run('')).toBeNull();
  });
});

describe('todayOrLater with an unchanged value', () => {
  const validate = todayOrLater(
    () => '2026-11-14',
    () => '2026-01-01',
  );
  const run = (value: string) => validate(new FormControl(value));

  it('accepts the unchanged past value', () => {
    expect(run('2026-01-01')).toBeNull();
  });

  it('still rejects any other past value', () => {
    expect(run('2026-01-02')).toEqual({ minDate: true });
  });

  it('treats a null unchanged value as no exception', () => {
    const v = todayOrLater(
      () => '2026-11-14',
      () => null,
    );
    expect(v(new FormControl('2026-01-01'))).toEqual({ minDate: true });
  });
});

describe('revisionOneYearAfter', () => {
  const group = (release: string, revision: string) =>
    new FormGroup({
      date_release: new FormControl(release),
      date_revision: new FormControl(revision),
    });

  it('passes when revision is release + 1 year', () => {
    expect(revisionOneYearAfter(group('2026-11-14', '2027-11-14'))).toBeNull();
    expect(revisionOneYearAfter(group('2024-02-29', '2025-02-28'))).toBeNull();
  });

  it('fails on mismatch', () => {
    expect(revisionOneYearAfter(group('2026-11-14', '2027-11-15'))).toEqual({
      revision: true,
    });
  });

  it('passes while either date is empty', () => {
    expect(revisionOneYearAfter(group('', ''))).toBeNull();
  });
});

describe('idAvailable', () => {
  const repo = (exists: () => Observable<boolean>) => {
    const fake = new FakeProductRepository();
    fake.exists.mockImplementation(exists);
    return fake;
  };
  const run = (r: FakeProductRepository, value: string) =>
    firstValueFrom(
      idAvailable(r, 0)(new FormControl(value)) as Observable<unknown>,
    );

  it('flags an existing id', async () => {
    expect(
      await run(
        repo(() => of(true)),
        'abc',
      ),
    ).toEqual({ idTaken: true });
  });

  it('accepts a free id', async () => {
    expect(
      await run(
        repo(() => of(false)),
        'abc',
      ),
    ).toBeNull();
  });

  it('skips the request for an empty id', async () => {
    const exists = vi.fn(() => of(true));
    expect(await run(repo(exists), '')).toBeNull();
    expect(exists).not.toHaveBeenCalled();
  });

  it('passes when the request fails', async () => {
    expect(
      await run(
        repo(() => throwError(() => new Error('x'))),
        'abc',
      ),
    ).toBeNull();
  });
});
