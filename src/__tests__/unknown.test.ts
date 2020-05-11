import * as t from 'type-shift';

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
