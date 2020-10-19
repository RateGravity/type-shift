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
  it('preserves strictness', () => {
    const converter = t.partial(
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

describe('ignoreUndeclared', () => {
  describe('removes any undefined fields not declared on the original object', () => {
    it('undefined typing', () => {
      const output = t.ignoreUndeclared(t.shape({ undefined: t.undefined }))({});
      expect(output).toStrictEqual({});
      expect(Object.keys(output)).not.toContain('undefined');
    });

    it('optional typing', () => {
      const output = t.ignoreUndeclared(t.shape({ optional: t.optional(t.string) }))({});
      expect(output).toStrictEqual({});
      expect(Object.keys(output)).not.toContain('optional');
    });
  });

  describe('keeps any undefined fields explicitly declared on the original object', () => {
    it('undefined typing', () => {
      const output = t.ignoreUndeclared(t.shape({ undefined: t.undefined }))({
        undefined: undefined
      });
      expect(output).toStrictEqual({ undefined: undefined });
      expect(Object.keys(output)).toContain('undefined');
    });

    it('optional typing', () => {
      const output = t.ignoreUndeclared(t.shape({ optional: t.optional(t.string) }))({
        optional: undefined
      });
      expect(output).toStrictEqual({ optional: undefined });
      expect(Object.keys(output)).toContain('optional');
    });
  });

  describe('keeps undeclared fields that resolved an input value', () => {
    it('using default', () => {
      const output = t.ignoreUndeclared(
        t.shape({ defaulted: t.optional(t.string).default(() => 'defaulted') })
      )({});
      expect(output).toMatchObject({
        defaulted: 'defaulted'
      });
    });

    it('using pipe', () => {
      const output = t.ignoreUndeclared(
        t.shape({ defaulted: t.optional(t.string).pipe(() => 'piped') })
      )({});
      expect(output).toMatchObject({
        defaulted: 'piped'
      });
    });

    it('using forPath', () => {
      const output = t.ignoreUndeclared(
        t.shape({ forPath: t.forPath([t.ParentPath, 'originalPath']) })
      )({ originalPath: 'originalPath' });
      expect(output).toMatchObject({
        forPath: 'originalPath'
      });
    });
  });

  it('still throws errors on bad conversion', () => {
    expect(() =>
      t.ignoreUndeclared(t.shape({ undefined: t.undefined }))({ undefined: 'string' })
    ).toThrowError();
  });
});
