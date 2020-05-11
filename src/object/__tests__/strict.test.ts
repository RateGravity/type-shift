import * as t from 'type-shift';

describe('strict', () => {
  it('converts an object by mapping types to keys', () => {
    const c = t.strict({
      one: t.string,
      two: t.optional(t.string)
    });
    expect(c.convert({ one: 'one' })).toEqual({
      one: 'one'
    });
  });
  it('only provides known properties', () => {
    const c = t.strict({
      one: t.string
    });
    expect(c.convert({ one: 'test', two: 'test' })).toEqual({
      one: 'test'
    });
  });

  it('fails if properties are missing', () => {
    const c = t.strict({
      one: t.string,
      two: t.number
    });
    expect(c.tryConvert({ two: 2 })).toMatchObject({ success: false });
  });

  it('exposes converters', () => {
    const converter = t.strict({
      one: t.number
    });
    expect(converter.converters).toEqual({
      one: t.number
    });
  });

  it('partial makes everything optional', () => {
    const c = t.strict({
      one: t.string,
      two: t.number
    });
    const p = c.partial;
    expect(p.convert({})).toEqual({});
  });

  it('partial maintains strictness', () => {
    const c = t.strict({
      one: t.string,
      two: t.number
    });
    const p = c.partial;
    expect(p.convert({ three: 3 })).toEqual({});
  });
});
