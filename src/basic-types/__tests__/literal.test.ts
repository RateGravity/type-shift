import * as t from 'type-shift';

describe('null', () => {
  it('converts null', () => {
    expect(t.null.tryConvert(null)).toMatchObject({
      success: true,
      value: null
    });
  });
});

describe('undefined', () => {
  it('converts undefined', () => {
    expect(t.undefined.tryConvert(undefined)).toMatchObject({
      success: true,
      value: undefined
    });
  });
});

describe('literal', () => {
  describe('boolean literal', () => {
    const trueValue = t.literal(true);
    it('converts exact value', () => {
      expect(trueValue.tryConvert(true)).toMatchObject({
        success: true,
        value: true
      });
    });
    it('rejects other value', () => {
      expect(trueValue.tryConvert(false)).toMatchObject({
        success: false,
        errors: [
          {
            expected: 'true',
            actual: false
          }
        ]
      });
    });
  });
});
