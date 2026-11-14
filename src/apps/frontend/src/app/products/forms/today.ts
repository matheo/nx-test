import { InjectionToken } from '@angular/core';

/** Returns today's local date as `yyyy-mm-dd`. Override in tests. */
export const TODAY = new InjectionToken<() => string>('TODAY', {
  providedIn: 'root',
  factory: () => () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  },
});
