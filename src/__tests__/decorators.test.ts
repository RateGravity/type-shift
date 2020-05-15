import { optional } from 'type-shift';

describe('optional converters', () => {
  it('allows undefined', () => {
    const c = optional(() => 1);
    expect(c(undefined, [], {})).toBe(undefined);
  });
  it('on not undefined passes through value', () => {
    const inner = jest.fn(() => 1);
    const path = ['foo'];
    const entity = {};
    expect(optional(inner)(3, path, entity)).toBe(1);
    expect(inner).toHaveBeenCalledWith(3, path, entity);
  });
});
