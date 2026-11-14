import { DisplayDatePipe } from './display-date.pipe';

describe('DisplayDatePipe', () => {
  const pipe = new DisplayDatePipe();

  it('formats yyyy-mm-dd as dd/mm/yyyy', () => {
    expect(pipe.transform('2000-01-01')).toBe('01/01/2000');
  });

  it.each([null, undefined, '', 'nope', '2000-1-1', '01/01/2000'])(
    'returns an empty string for %s',
    (value) => {
      expect(pipe.transform(value)).toBe('');
    },
  );
});
