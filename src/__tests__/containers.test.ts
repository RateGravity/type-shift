import * as t from 'type-shift';

describe('arrayConverter', () => {
  it('throws if not array', () => {
    expect(() => t.array(t.string)(null, [], {})).toThrow();
  });
  it('converts all values if array', () => {
    expect(t.array(t.string)(['1', '2', ''], [], {})).toEqual(['1', '2', '']);
  });
  it('throws if some dont convert', () => {
    expect(() => t.array(t.number)(['one', 'two'], [], {})).toThrow();
  });
  it('invokes with index', () => {
    const converter = jest.fn(() => '');
    const entity = { test: ['1', '2', '3'], other: 'foo' };
    t.array(converter)([1, 2, 3], ['test'], entity);
    expect(converter.mock.calls).toEqual([
      [1, ['test', 0], entity],
      [2, ['test', 1], entity],
      [3, ['test', 2], entity]
    ]);
  });
});

describe('recordConverter', () => {
  it('converts all values of the record', () => {
    expect(t.record(t.string)({ 1: '1', 2: '2', 3: '' }, [], {})).toEqual({
      1: '1',
      2: '2',
      3: ''
    });
  });

  it('throws an error if the converter fails', () => {
    expect(() => t.record(t.number)({ 1: 'five' }, [], {})).toThrow();
  });

  it('can convert a complex record', () => {
    expect(
      t.record(t.strict({ string: t.string, num: t.number }))(
        { 1: { string: '123', num: 123 } },
        [],
        {}
      )
    ).toEqual({ 1: { string: '123', num: 123 } });
  });
});
