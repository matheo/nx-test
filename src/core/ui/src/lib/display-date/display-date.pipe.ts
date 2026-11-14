import { Pipe, PipeTransform } from '@angular/core';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Formats a `yyyy-mm-dd` string as `dd/mm/yyyy` without using `Date`. */
@Pipe({ name: 'displayDate' })
export class DisplayDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const match = value ? ISO_DATE.exec(value.trim()) : null;
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
  }
}
