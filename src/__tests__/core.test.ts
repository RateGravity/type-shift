import { createConverter } from 'type-shift';

describe('createConverter', () => {
  it('creates converter with name of function', () => {
    function one() {
      return 1;
    }
    const converter = createConverter(one);
    expect(converter).toHaveProperty('displayName', 'one');
  });
  it('creates converter with displayName', () => {
    function one() {
      return 1;
    }
    (one as any).displayName = 'two';
    const converter = createConverter(one);
    expect(converter).toHaveProperty('displayName', 'two');
  });
  it('creates converter with name', () => {
    function one() {
      return 1;
    }
    const converter = createConverter(one, 'three');
    expect(converter).toHaveProperty('displayName', 'three');
  });
  it('creates a converter that passes through default path and entity', () => {
    const inner = jest.fn(() => 1);
    const converter = createConverter(inner);
    converter(1);
    expect(inner).toHaveBeenCalledWith(1, [], 1);
  });
  it('pipes data into the next function', () => {
    const one = jest.fn(() => 1);
    const two = jest.fn(() => 2);
    const converter = createConverter(one).pipe(two);
    expect(converter(0)).toBe(2);
    expect(one).toHaveBeenCalledWith(0, [], 0);
    expect(two).toHaveBeenCalledWith(1, [], 0);
  });
  it('chains name of piped function', () => {
    const one = () => 1;
    const two = () => 2;
    const converter = createConverter(one).pipe(two);
    expect(converter.displayName).toBe('one -> two');
  });
  it('uses anonymous name if pipe is anonymous', () => {
    const converter = createConverter(() => 1, 'three').pipe(() => 2);
    expect(converter.displayName).toBe('three -> anonymous');
  });
  it('uses given name for piped function', () => {
    const one = () => 1;
    const two = () => 2;
    const converter = createConverter(one).pipe(two, 'three');
    expect(converter.displayName).toBe('three');
  });
  it('ors two or more converters', () => {
    const one = jest.fn(() => {
      throw new Error();
    });
    const two = jest.fn(() => 2);
    const converter = createConverter(one).or(two);
    expect(converter(0)).toBe(2);
    expect(one).toHaveBeenCalledWith(0, [], 0);
    expect(two).toHaveBeenCalledWith(0, [], 0);
  });
  it('or returns first successful result', () => {
    const one = jest.fn(() => 1);
    const two = jest.fn(() => 2);
    const converter = createConverter(one).or(two);
    expect(converter(0)).toBe(1);
    expect(two).not.toHaveBeenCalled();
  });
  it('or throws if all throw', () => {
    const one = jest.fn(() => {
      throw new Error();
    });
    const two = jest.fn(() => {
      throw new Error();
    });
    const converter = createConverter(one).or(two);
    expect(() => converter(0)).toThrow();
  });
  it(`default falls back on undefined`, () => {
    const one = createConverter((v) => v);
    const converter = one.default(() => 'value');
    expect(converter(undefined)).toBe('value');
  });
  it('default passes default value through converter', () => {
    const one = createConverter<string, number | string>((v) => v.toString());
    const converter = one.default(() => 5);
    expect(converter(undefined)).toBe('5');
  });
  it('default throws if the default value converter throws', () => {
    const converter = createConverter((v) => v).default(() => {
      throw new Error();
    });
    expect(() => converter(undefined)).toThrow();
  });
  it("default doesn't invoke default converter if defined", () => {
    const one = createConverter((v) => v);
    const d = jest.fn(() => 5);
    const converter = one.default(d);
    converter(3);
    expect(d).not.toHaveBeenCalled();
  });
  it('default throws if converter function throws', () => {
    const one = createConverter(() => {
      throw new Error();
    });
    const converter = one.default(() => 5);
    expect(() => converter(undefined)).toThrow();
  });
  it("default doesn't invoke default converter if converter throws on a defined value", () => {
    const one = createConverter(() => {
      throw new Error();
    });
    const d = jest.fn(() => 5);
    const converter = one.default(d);
    try {
      converter(3);
    } catch (_) {
      // no-op
    }
    expect(d).not.toHaveBeenCalled();
  });
});
