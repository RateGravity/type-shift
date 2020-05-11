import * as t from 'type-shift';

describe('never', () => {
  it.each([1000, 'test', true, [], {}])('does not convert %s', (input: unknown) => {
    const r = t.never.tryConvert(input);
    expect(r).toMatchObject({
      success: false
    });
  });
  it('converts missing value', () => {
    const r = t.never.tryConvertNode(t.missingRootNode());
    expect(r).toMatchObject({
      success: true
    });
  });
});

describe('unknown', () => {
  it.each([1000, 'test', true, [], {}])('converts %s', (input: unknown) => {
    const r = t.unknown.tryConvert(input);
    expect(r).toMatchObject({
      success: true,
      value: input
    });
  });

  it('does not convert missing value', () => {
    const r = t.unknown.tryConvertNode(t.missingRootNode());
    expect(r).toMatchObject({
      success: false
    });
  });
});
