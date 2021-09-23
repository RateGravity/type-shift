import * as t from 'type-shift';

describe('createConverter', () => {
  it('creates converter with name of function', () => {
    function one() {
      return 1;
    }
    const converter = t.createConverter(one);
    expect(converter).toHaveProperty('displayName', 'one');
  });
  it('creates converter with displayName', () => {
    function one() {
      return 1;
    }
    (one as any).displayName = 'two';
    const converter = t.createConverter(one);
    expect(converter).toHaveProperty('displayName', 'two');
  });
  it('creates converter with name', () => {
    function one() {
      return 1;
    }
    const converter = t.createConverter(one, 'three');
    expect(converter).toHaveProperty('displayName', 'three');
  });
  it('creates a converter that passes through default path and entity', () => {
    const inner = jest.fn(() => 1);
    const converter = t.createConverter(inner);
    converter(1);
    expect(inner).toHaveBeenCalledWith(1, [], 1);
  });
  it('pipes data into the next function', () => {
    const one = jest.fn(() => 1);
    const two = jest.fn(() => 2);
    const converter = t.createConverter(one).pipe(two);
    expect(converter(0)).toBe(2);
    expect(one).toHaveBeenCalledWith(0, [], 0);
    expect(two).toHaveBeenCalledWith(1, [], 0);
  });
  it('chains name of piped function', () => {
    const one = () => 1;
    const two = () => 2;
    const converter = t.createConverter(one).pipe(two);
    expect(converter.displayName).toBe('one -> two');
  });
  it('uses anonymous name if pipe is anonymous', () => {
    const converter = t.createConverter(() => 1, 'three').pipe(() => 2);
    expect(converter.displayName).toBe('three -> anonymous');
  });
  it('uses given name for piped function', () => {
    const one = () => 1;
    const two = () => 2;
    const converter = t.createConverter(one).pipe(two, 'three');
    expect(converter.displayName).toBe('three');
  });
  it('ors two or more converters', () => {
    const one = jest.fn(() => {
      throw new Error();
    });
    const two = jest.fn(() => 2);
    const converter = t.createConverter(one).or(two);
    expect(converter(0)).toBe(2);
    expect(one).toHaveBeenCalledWith(0, [], 0);
    expect(two).toHaveBeenCalledWith(0, [], 0);
  });
  it('or returns first successful result', () => {
    const one = jest.fn(() => 1);
    const two = jest.fn(() => 2);
    const converter = t.createConverter(one).or(two);
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
    const converter = t.createConverter(one).or(two);
    expect(() => converter(0)).toThrow();
  });
  it('or throws error with more errors', () => {
    const less = new t.ConverterError('test', 'not-test', ['field', 0]);
    const more = new t.ConverterError('test', 'not-test', ['field', 0]);
    more.errorFields['$.field[1]'] = { expected: 'test', actual: 'not-test' };
    const converter = t
      .createConverter(() => {
      throw less;
      })
      .or(() => {
      throw more;
    });
    expect(() => converter(0)).toThrow(more);
  });
  it('or thows error with deeper errors', () => {
    const shallow = new t.ConverterError('test', 'not-test', ['field', 0]);
    const deep = new t.ConverterError('test', 'not-test', ['field', 0, 'other']);
    const converter = t
      .createConverter(() => {
      throw shallow;
      })
      .or(() => {
      throw deep;
    });
    expect(() => converter(0)).toThrow(deep);
  });
  it('or prefers deeper errors over more errors', () => {
    const moreShallow = new t.ConverterError('test', 'not-test', ['field', 0]);
    moreShallow.errorFields['$.field[1]'] = { expected: 'test', actual: 'not-test' };
    const lessDeep = new t.ConverterError('test', 'not-test', ['field', 0, 'other']);
    const converter = t
      .createConverter(() => {
      throw moreShallow;
      })
      .or(() => {
      throw lessDeep;
    });
    expect(() => converter(0)).toThrow(lessDeep);
  });
  it('or uses count of errors at max depth', () => {
    const twoDeepest = new t.ConverterError('test', 'not-test', ['field']);
    twoDeepest.errorFields['$.field[0]'] = { expected: 'test', actual: 'not-test' };
    twoDeepest.errorFields['$.field[1]'] = { expected: 'test', actual: 'not-test' };
    const oneDeepest = new t.ConverterError('test', 'not-test', ['field']);
    oneDeepest.errorFields['$.other'] = { expected: 'test', actual: 'not-test' };
    oneDeepest.errorFields['$.field[0]'] = { expected: 'test', actual: 'not-test' };
    const converter = t
      .createConverter(() => {
      throw twoDeepest;
      })
      .or(() => {
      throw oneDeepest;
    });
    expect(() => converter(0)).toThrow(twoDeepest);
  });
  it('or throws new errors if the errors tie depth and count', () => {
    const errorOne = new t.ConverterError('test', 'not-test', ['field']);
    errorOne.errorFields['$.field[0]'] = { expected: 'test', actual: 'not-test' };
    errorOne.errorFields['$.field[1]'] = { expected: 'test', actual: 'not-test' };
    const errorTwo = new t.ConverterError('test', 'not-test', ['other']);
    errorTwo.errorFields['$.other[0]'] = { expected: 'test', actual: 'not-test' };
    errorTwo.errorFields['$.other[1]'] = { expected: 'test', actual: 'not-test' };
    const converter = t
      .createConverter(() => {
      throw errorOne;
      })
      .or(() => {
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
    const one = t.createConverter((v) => v);
    const converter = one.default(() => 'value');
    expect(converter(undefined)).toBe('value');
  });
  it('default passes default value through converter', () => {
    const one = t.createConverter<string, number | string>((v) => v.toString());
    const converter = one.default(() => 5);
    expect(converter(undefined)).toBe('5');
  });
  it('default throws if the default value converter throws', () => {
    const converter = t
      .createConverter((v) => v)
      .default(() => {
      throw new Error();
    });
    expect(() => converter(undefined)).toThrow();
  });
  it("default doesn't invoke default converter if defined", () => {
    const one = t.createConverter((v) => v);
    const d = jest.fn(() => 5);
    const converter = one.default(d);
    converter(3);
    expect(d).not.toHaveBeenCalled();
  });
  it('default throws if converter function throws', () => {
    const one = t.createConverter(() => {
      throw new Error();
    });
    const converter = one.default(() => 5);
    expect(() => converter(undefined)).toThrow();
  });
  it("default doesn't invoke default converter if converter throws on a defined value", () => {
    const one = t.createConverter(() => {
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
