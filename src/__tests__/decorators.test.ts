import * as t from 'type-shift';

describe('optional converters', () => {
  it('allows undefined', () => {
    const c = t.optional(t.string);
    expect(c(undefined, [], {})).toBe(undefined);
  });
  it('on not undefined passes through value', () => {
    const inner = jest.fn(() => 1);
    const path = ['foo'];
    const entity = {};
    expect(t.optional(inner)(3, path, entity)).toBe(1);
    expect(inner).toHaveBeenCalledWith(3, path, entity);
  });
  it('chains with default correctly', () => {
    const c = t.optional(t.string.default(() => 'test'));
    expect(c(undefined)).toBe('test');
  });
  it('chains with default using path correctly', () => {
    const c = t.optional(t.string.default(t.forPath(['test'])));
    const structure = t.strict({ notTest: c });
    expect(structure({})).toEqual({ notTest: undefined });
  });
  it.each([undefined, 'test', { name: 'test', count: 2 }])(
    'chains with or correctly given %o',
    (value) => {
      const c = t.optional(
        t.string.or(
          t.strict({
            name: t.string,
            count: t.number
          })
        )
      );
      expect(c(value)).toEqual(value);
    }
  );
  it('chains with default and struct correctly when a deep field is undefined', () => {
    const c = t.optional(
      t
        .strict({
          name: t.string,
          count: t.number
        })
        .default(() => ({ name: 'test' }))
    );
    expect(() => c(undefined)).toThrow();
  });
});
