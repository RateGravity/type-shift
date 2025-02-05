import { ConverterError } from 'type-shift';

describe('ConverterError', () => {
  it('exposes error paths', () => {
    const error = new ConverterError(true, 'number', ['a', 0]);
    expect(error.errorFields).toEqual({
      '$.a[0]': {
        expected: 'number',
        actual: 'true'
      }
    });
  });

  it('exposes issues', () => {
    const error = new ConverterError(true, 'number', ['a', 0]);
    expect(error.issues).toEqual([
      {
        path: ['a', 0],
        expected: 'number',
        actual: true
      }
    ]);
  });
});
