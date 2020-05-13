import { convert } from 'type-shift';

describe('convert', () => {
  it('invokes the converter with an empty path and the input', () => {
    const converter = jest.fn((_: unknown) => 1);
    const c = convert(converter);
    (c as any)(5, ['not-empty'], {});
    expect(converter).toHaveBeenLastCalledWith(5, [], 5);
  });
  it('returns the converted result', () => {
    const converter = (_: unknown) => 1;
    const c = convert(converter);
    const r = c(5);
    expect(r).toBe(1);
  });
});
