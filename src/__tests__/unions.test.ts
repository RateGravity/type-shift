import * as t from 'type-shift';

interface FixedQuote {
  type: 'fixed';
  rate: number;
}

interface AdjustableQuote {
  type: 'adjustable';
  rate: number;
  cap: number;
}

describe('union', () => {
  it('converts based on tag value', () => {
    expect(
      t.taggedUnion<FixedQuote | AdjustableQuote>('type', {
        fixed: t.strict({
          type: t.oneOf(['fixed']),
          rate: t.number
        }),
        adjustable: t.strict({
          type: t.oneOf(['adjustable']),
          rate: t.number,
          cap: t.number
        })
      })(
        {
          type: 'fixed',
          rate: 3.75
        },
        [],
        {}
      )
    ).toEqual({
      type: 'fixed',
      rate: 3.75
    });
  });
  it('throws if the tag value isnt present', () => {
    expect(() =>
      t.taggedUnion<FixedQuote | AdjustableQuote>('type', {
        fixed: t.strict({
          type: t.oneOf(['fixed']),
          rate: t.number
        }),
        adjustable: t.strict({
          type: t.oneOf(['adjustable']),
          rate: t.number,
          cap: t.number
        })
      })({ rate: 3.75 }, [], {})
    ).toThrow();
  });
  it('throws if the tag value isnt in the set of options', () => {
    expect(() =>
      t.taggedUnion<FixedQuote | AdjustableQuote>('type', {
        fixed: t.strict({
          type: t.oneOf(['fixed']),
          rate: t.number
        }),
        adjustable: t.strict({
          type: t.oneOf(['adjustable']),
          rate: t.number,
          cap: t.number
        })
      })({ type: 'floating' })
    ).toThrow();
  });
});

describe('oneOf', () => {
  it('passes if value is one of given values', () => {
    expect(t.oneOf(['a', 'b', 'c'])('b', [], {})).toBe('b');
  });

  it('throws an error is value isnt part of valid set', () => {
    expect(() => t.oneOf(['a', 'b', 'c'])('d', [], {})).toThrow();
  });
});

interface Shirt {
  bust: number;
  width: number;
  length: number;
}

interface Pants {
  width: number;
  length: number;
}

const pantsConverter = t.shape<Pants>({
  width: t.number,
  length: t.number
});

const shirtConverter = t.shape<Shirt>({
  bust: t.number,
  width: t.number,
  length: t.number
});

describe('select', () => {
  it('properly passes through conversion functions', () => {
    const clothingConverter = t.select<Pants | Shirt, object>((input: object) =>
      'bust' in input ? shirtConverter : pantsConverter
    );

    expect(clothingConverter({ bust: '30', width: '32', length: '30' })).toMatchObject({
      bust: 30,
      width: 32,
      length: 30
    });
    expect(clothingConverter({ width: '32', length: '34' })).toMatchObject({
      width: 32,
      length: 34
    });
  });
});
