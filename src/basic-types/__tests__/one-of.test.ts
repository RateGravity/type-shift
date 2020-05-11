import * as t from 'type-shift';

describe('oneOf', () => {
  it('passes if value is one of given values', () => {
    expect(t.oneOf('a', 'b', 'c').tryConvert('b')).toMatchObject({ success: true, value: 'b' });
  });

  it('fails if value isnt part of valid set', () => {
    expect(t.oneOf('a', 'b', 'c').tryConvert('d')).toMatchObject({ success: false });
  });

  it('uses formatted | join of names', () => {
    const c = t.oneOf<'a' | true | 5>('a', true, 5);
    expect(c.name).toBe('"a" | true | 5');
  });
});
