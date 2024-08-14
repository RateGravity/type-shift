import * as t from 'type-shift';

describe('strict', () => {
  it('converts an object by mapping types to keys', () => {
    expect(
      t.strict({
        one: t.string,
        two: t.optional(t.string)
      })(
        {
          one: 'one'
        },
        [],
        {}
      )
    ).toEqual({
      one: 'one',
      two: undefined
    });
  });
  it('only provides known properties', () => {
    expect(
      t.strict({
        one: t.string
      })({ one: 'test', two: 'test' }, [], {})
    ).toEqual({
      one: 'test'
    });
  });
  it('invokes converter with value, key, and whole object', () => {
    const converter = jest.fn(t.string);
    const record = { one: 'test', two: 'test' };
    t.strict({
      one: converter
    })(record, [], record);
    expect(converter).toHaveBeenCalledWith('test', ['one'], record);
  });
  it('exposes converters', () => {
    const converter = t.strict({
      one: t.number
    });
    expect(converter.converters).toEqual({
      one: expect.objectContaining({
        displayName: 'number'
      })
    });
  });
});

describe('shape', () => {
  it('converts an object by mapping types to keys', () => {
    expect(
      t.shape({
        one: t.string,
        two: t.optional(t.string)
      })(
        {
          one: 'one'
        },
        [],
        {}
      )
    ).toEqual({
      one: 'one',
      two: undefined
    });
  });
  it('provides unknown properties', () => {
    expect(
      t.shape({
        one: t.string
      })({ one: 'test', two: 'test' }, [], {})
    ).toEqual({
      one: 'test',
      two: 'test'
    });
  });
  it('invokes converter with value, key, and whole object', () => {
    const converter = jest.fn(t.string);
    const record = { one: 'test', two: 'test' };
    t.shape({
      one: converter
    })(record, [], record);
    expect(converter).toHaveBeenCalledWith('test', ['one'], record);
  });
  it('exposes converters', () => {
    const converter = t.shape({
      one: t.number
    });
    expect(converter.converters).toEqual({
      one: expect.objectContaining({
        displayName: 'number'
      })
    });
  });
});

describe('decorate', () => {
  describe('partial', () => {
    it('applies the decorator to all fields', () => {
      const converter = t.decorate(t.optional)(
        t.shape({
          one: t.string
        })
      );
      const v = converter({});
      expect(v.one).not.toBeDefined();
    });

    it('preserves strictness', () => {
      const converter = t.decorate(t.optional)(
        t.shape({
          one: t.string
        })
      );
      const v = converter({ two: 'test' });
      expect(v).toEqual({
        one: undefined,
        two: 'test'
      });
    });
  });

  describe('partial', () => {
    it('makes all fields optional', () => {
      const converter = t.partial(
        t.strict({
          one: t.string
        })
      );
      const v = converter({});
      expect(v.one).not.toBeDefined();
    });
  });

  describe('nonish', () => {
    it('makes all fields noneable', () => {
      const converter = t.nonish(
        t.shape({
          one: t.string,
          two: t.string
        })
      );
      const v = converter({ two: null });
      expect(v).toEqual({ one: undefined, two: null });
    });
  });

  describe('nonishAsUndefined', () => {
    it('makes all fields noneableAsUndefined', () => {
      const converter = t.nonishAsUndefined(
        t.shape({
          one: t.string,
          two: t.string
        })
      );
      const v = converter({ two: null });
      expect(v).toEqual({ one: undefined, two: undefined });
    });
  });

  describe('nonishAsNull', () => {
    it('makes all fields nonishAsNull', () => {
      const converter = t.nonishAsNull(
        t.shape({
          one: t.string,
          two: t.string
        })
      );
      const v = converter({ two: null });
      expect(v).toEqual({ one: null, two: null });
    });
  });
});
