import * as t from 'type-shift';

describe('number', () => {
  it('converts numbers', () => {
    expect(t.number.tryConvert(1)).toMatchObject({
      success: true,
      value: 1
    });
  });
  it.each(['1', true, [1], { num: 1 }])('doesnt convert %s', (input) => {
    expect(t.number.tryConvert(input)).toMatchObject({
      success: false
    });
  });
});

describe('string', () => {
  it('converts strings', () => {
    expect(t.string.tryConvert('1')).toMatchObject({
      success: true,
      value: '1'
    });
  });
  it.each([1, true, [1], { num: 1 }])('doesnt convert %s', (input) => {
    expect(t.string.tryConvert(input)).toMatchObject({
      success: false
    });
  });
});

describe('boolean', () => {
  it.each([true, false])('converts boolean %s', (value) => {
    expect(t.boolean.tryConvert(value)).toMatchObject({
      success: true,
      value
    });
  });
  it.each([1, '1', [1], { num: 1 }])('doesnt convert %s', (input) => {
    expect(t.boolean.tryConvert(input)).toMatchObject({
      success: false
    });
  });
});
