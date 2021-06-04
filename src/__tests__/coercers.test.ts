import * as t from 'type-shift';

describe('coerce', () => {
  it('works with a single converter', () => {
    const coercer = t.coerce([t.string], 3);
    expect(coercer('test')).toBe(3);
  });

  it('works with three converters', () => {
    const coercer = t.coerce([t.string, t.boolean, t.null], 3);
    expect(coercer('test')).toBe(3);
    expect(coercer(true)).toBe(3);
    expect(coercer(null)).toBe(3);
  });

  it('works with complex converters', () => {
    const coercer = t.coerce([t.string, t.boolean, t.none], 3);
    expect(coercer('test')).toBe(3);
    expect(coercer(true)).toBe(3);
    expect(coercer(null)).toBe(3);
    expect(coercer(undefined)).toBe(3);
  });
});

describe('noneAsNull', () => {
  it('coerces undefined to null ', () => {
    expect(t.noneAsNull(undefined)).toBe(null);
  });

  it('passes null thru', () => {
    expect(t.noneAsNull(null)).toBe(null);
  });
});

describe('noneAsUndefined', () => {
  it('passes undefined thru', () => {
    expect(t.noneAsUndefined(undefined)).toBe(undefined);
  });

  it('coerces null to undefined', () => {
    expect(t.noneAsUndefined(null)).toBe(undefined);
  });
});
