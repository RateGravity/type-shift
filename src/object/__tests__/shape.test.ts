import * as t from 'type-shift';

describe('shape', () => {
  it('converts an object by mapping types to keys', () => {
    const c = t.shape({
      one: t.string,
      two: t.optional(t.string)
    });
    expect(
      c.convert({
        one: 'one'
      })
    ).toEqual({
      one: 'one'
    });
  });
  it('provides unknown properties', () => {
    const c = t.shape({
      one: t.string
    });
    expect(c.convert({ one: 'test', two: 'test' })).toEqual({
      one: 'test',
      two: 'test'
    });
  });
  it('exposes converters', () => {
    const converter = t.shape({
      one: t.number
    });
    expect(converter.converters).toEqual({
      one: t.number
    });
  });

  it('partial makes everything optional', () => {
    const c = t.shape({
      one: t.string,
      two: t.number
    });
    const p = c.partial;
    expect(p.convert({})).toEqual({});
  });

  it('partial maintains strictness', () => {
    const c = t.shape({
      one: t.string,
      two: t.number
    });
    const p = c.partial;
    expect(p.convert({ three: 3 })).toEqual({ three: 3 });
  });
});
