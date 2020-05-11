import { ConverterError } from 'type-shift';

describe('ConverterError', () => {
  it('exposes error paths', () => {
    const error = new ConverterError('$.foo', 'number', 0);
    expect(error).toMatchObject({
      path: '$.foo',
      expected: 'number',
      actual: 0
    });
  });

  it('has no actual value when empty', () => {
    const error = new ConverterError('$.foo', 'number');
    expect(error).not.toHaveProperty('actual');
  });

  it('can have undefined actual', () => {
    const error = new ConverterError('$.foo', 'number', undefined);
    expect(error).toHaveProperty('actual', undefined);
  });
});
