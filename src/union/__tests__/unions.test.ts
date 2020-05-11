import * as t from 'type-shift';

interface Shirt {
  type: 'shirt';
  bust: number;
  width: number;
  length: number;
}

interface Pants {
  type: 'pants';
  width: number;
  length: number;
}

const pantsConverter = t.shape<Pants>({
  type: t.literal('pants'),
  width: t.number,
  length: t.number
});

const shirtConverter = t.shape<Shirt>({
  type: t.literal('shirt'),
  bust: t.number,
  width: t.number,
  length: t.number
});

describe('union', () => {
  it('passes through to converter based on selector', () => {
    const c = t.union<Shirt | Pants, object>(
      (input: object) => ('bust' in input ? 'shirt' : 'pants'),
      {
        shirt: shirtConverter,
        pants: pantsConverter
      }
    );
    expect(c.convert({ type: 'shirt', bust: 30, width: 32, length: 30 })).toMatchObject({
      type: 'shirt',
      bust: 30,
      width: 32,
      length: 30
    });
  });

  it('with path converts based on tag value', () => {
    const c = t.union<Shirt | Pants>('type', {
      shirt: shirtConverter,
      pants: pantsConverter
    });

    expect(c.convert({ type: 'shirt', bust: 30, width: 32, length: 30 })).toMatchObject({
      type: 'shirt',
      bust: 30,
      width: 32,
      length: 30
    });
  });
  it('fails if the tag value isnt present', () => {
    const c = t.union<Shirt | Pants>('type', {
      shirt: shirtConverter,
      pants: pantsConverter
    });
    expect(c.tryConvert({ width: 32, length: 30 })).toMatchObject({ success: false });
  });
  it('fails if the tag value isnt in the set of options', () => {
    const c = t.union<Shirt | Pants>('type', {
      shirt: shirtConverter,
      pants: pantsConverter
    });
    expect(c.tryConvert({ type: 'dress', width: 32, length: 30 })).toMatchObject({
      success: false
    });
  });
});
