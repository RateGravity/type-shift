import * as t from 'type-shift';

describe('recordConverter', () => {
  it('converts all values of the record', () => {
    const r = t.record(t.string);
    expect(r.tryConvert({ 1: '1', 2: '2', 3: '' })).toMatchObject({
      success: true,
      value: {
        1: '1',
        2: '2',
        3: ''
      }
    });
  });

  it('fails an error if the converter fails', () => {
    const r = t.record(t.number);
    expect(r.tryConvert({ five: 1, two: 'two' })).toMatchObject({
      success: false,
      errors: [{ path: '$.two', expected: 'number', actual: 'two' }]
    });
  });
});
