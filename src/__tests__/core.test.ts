import { createConverter, ConverterError } from 'type-shift';

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
  it('or throws error with more errors', () => {
    const less = new ConverterError('test', 'not-test', ['field', 0]);
    const more = new ConverterError('test', 'not-test', ['field', 0]);
    more.issues.push({ path: ['field', 1], expected: 'test', actual: 'not-test' });
    const converter = createConverter(() => {
      throw less;
    }).or(() => {
      throw more;
    });
    expect(() => converter(0)).toThrow(more);
  });
  it('or thows error with deeper errors', () => {
    const shallow = new ConverterError('test', 'not-test', ['field', 0]);
    const deep = new ConverterError('test', 'not-test', ['field', 0, 'other']);
    const converter = createConverter(() => {
      throw shallow;
    }).or(() => {
      throw deep;
    });
    expect(() => converter(0)).toThrow(deep);
  });
  it('or prefers deeper errors over more errors', () => {
    const moreShallow = new ConverterError('test', 'not-test', ['field', 0]);
    moreShallow.issues.push({ path: ['field', 1], expected: 'test', actual: 'not-test' });
    const lessDeep = new ConverterError('test', 'not-test', ['field', 0, 'other']);
    const converter = createConverter(() => {
      throw moreShallow;
    }).or(() => {
      throw lessDeep;
    });
    expect(() => converter(0)).toThrow(lessDeep);
  });
  it('or uses count of errors at max depth', () => {
    const twoDeepest = new ConverterError('test', 'not-test', ['field']);
    twoDeepest.issues.push({ path: ['field', 0], expected: 'test', actual: 'not-test' });
    twoDeepest.issues.push({ path: ['field', 1], expected: 'test', actual: 'not-test' });
    const oneDeepest = new ConverterError('test', 'not-test', ['field']);
    oneDeepest.issues.push({ path: ['other'], expected: 'test', actual: 'not-test' });
    oneDeepest.issues.push({ path: ['field', 0], expected: 'test', actual: 'not-test' });
    const converter = createConverter(() => {
      throw twoDeepest;
    }).or(() => {
      throw oneDeepest;
    });
    expect(() => converter(0)).toThrow(twoDeepest);
  });
  it('or throws new errors if the errors tie depth and count', () => {
    const errorOne = new ConverterError('test', 'not-test', ['field']);
    errorOne.issues.push({ path: ['field', 0], expected: 'test', actual: 'not-test' });
    errorOne.issues.push({ path: ['field', 1], expected: 'test', actual: 'not-test' });
    const errorTwo = new ConverterError('test', 'not-test', ['other']);
    errorTwo.issues.push({ path: ['other', 0], expected: 'test', actual: 'not-test' });
    errorTwo.issues.push({ path: ['other', 1], expected: 'test', actual: 'not-test' });
    const converter = createConverter(() => {
      throw errorOne;
    }).or(() => {
      throw errorTwo;
    });
    expect.assertions(2);
    try {
      converter(0);
    } catch (err) {
      expect(err).not.toBe(errorOne);
      expect(err).not.toBe(errorTwo);
    }
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

  it('exposes the ~standard schema', () => {
    const converter = createConverter((value) => value);
    expect(converter).toHaveProperty(
      '~standard',
      expect.objectContaining({
        version: 1,
        vendor: 'type-shift',
        validate: expect.any(Function)
      })
    );
  });

  it('~standard.validate validates the schema', () => {
    const validator = jest.fn(() => 5);
    const converter = createConverter(validator);
    const result = converter['~standard'].validate(1);
    expect(result).toEqual({ value: 5 });
  });

  it('~standard.validate passes the input, and root path to the converter', () => {
    const validator = jest.fn(() => 5);
    const converter = createConverter(validator);
    converter['~standard'].validate(1);
    expect(validator).toHaveBeenCalledWith(1, [], 1);
  });

  it('~standard.validate returns the issues if the converter throws a ConverterError', () => {
    const validator = jest.fn(() => {
      throw new ConverterError('test', 'not-test', ['field', 0]);
    });
    const converter = createConverter(validator);
    const result = converter['~standard'].validate(1);
    expect(result).toEqual({
      issues: [{ message: 'expected not-test but was "test"', path: ['field', 0] }]
    });
  });

  it('~standard.validate returns the issues if the converter throws a regular error', () => {
    const validator = jest.fn(() => {
      throw new Error('test');
    });
    const converter = createConverter(validator);
    const result = converter['~standard'].validate(1);
    expect(result).toEqual({ issues: [{ message: 'test' }] });
  });
});
