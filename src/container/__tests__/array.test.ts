import * as t from 'type-shift';

describe('array', () => {
  it('fails if not array', () => {
    const a = t.array(t.string);
    expect(a.tryConvert(null)).toMatchObject({ success: false });
  });
  it('converts all values if array', () => {
    const a = t.array(t.string);
    expect(a.tryConvert(['1', '2', ''])).toMatchObject({ value: ['1', '2', ''] });
  });
  it('fails if some dont convert', () => {
    const a = t.array(t.number);
    expect(a.tryConvert([1, 'two', 3])).toMatchObject({
      success: false,
      errors: [{ path: '$[1]', expected: 'number', actual: 'two' }]
    });
  });
});
