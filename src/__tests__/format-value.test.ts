import { formatValue } from 'type-shift';

describe('formatValue', () => {
  it('formats string', () => {
    expect(formatValue('test')).toBe('"test"');
  });
  it('formats number', () => {
    expect(formatValue(5)).toBe('5');
  });
  it('formats boolean', () => {
    expect(formatValue(true)).toBe('true');
  });
  it('formats null', () => {
    expect(formatValue(null)).toBe('null');
  });
  it('formats undefined', () => {
    expect(formatValue(undefined)).toBe('undefined');
  });
  it('formats array', () => {
    expect(formatValue([1, 2, 3])).toBe('[1, 2, 3]');
  });
  it('formats object', () => {
    expect(formatValue({ test: 'foo', other: 'bar' })).toBe('{test: "foo", other: "bar"}');
  });
});
