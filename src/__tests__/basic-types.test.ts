import * as t from 'type-shift';

describe('primitive types', () => {
  it('Number convert numbers', () => {
    expect(t.number(3, [], {})).toBe(3);
  });
  it('Number throws if not a number', () => {
    expect(() => t.number('test', [], {})).toThrow();
  });
  it('Number converts treats strings as numbers', () => {
    expect(t.number('3', [], {})).toBe(3);
  });
  it('Number throws on null values', () => {
    expect(() => t.number(null, [], {})).toThrow();
  });
  it('Number throws on boolean values', () => {
    expect(() => t.number(false, [], {})).toThrow();
  });
  it('Boolean converts booleans', () => {
    expect(t.boolean(false, [], {})).toBe(false);
  });
  it('Boolean converter throws if undefined', () => {
    expect(() => t.boolean(undefined, [], {})).toThrow();
  });
  it('Boolean converter throws if null', () => {
    expect(() => t.boolean(null, [], {})).toThrow();
  });
  it('Boolean converter converts a Boolean', () => {
    expect(t.boolean(Boolean(true), [], {})).toBe(true);
  });
  it('Unknown Converter passes through all values', () => {
    expect(t.unknown(undefined, [], {})).toBe(undefined);
  });
  it('Never converter always throws', () => {
    expect(() => t.never(true, [], {})).toThrow();
  });
  it('Null converts null values', () => {
    expect(t.null(null, [], {})).toBe(null);
  });
  it('Null fails to converter non-null values', () => {
    expect(() => t.null(undefined, [], {})).toThrow();
  });
  it('Undefined converts undefined values', () => {
    expect(t.undefined(undefined, [], {})).toBe(undefined);
  });
  it('Undefined fails to convert undefined values', () => {
    expect(() => t.undefined(null, [], {})).toThrow();
  });

  describe('string', () => {
    describe('from string', () => {
      it('converts simple strings', () => {
        expect(t.string('lol')).toBe('lol');
      });

      describe('converts numerical strings', () => {
        it('converts integer strings', () => {
          expect(t.string('1324535415')).toBe('1324535415');
        });
        it('converts decimal strings', () => {
          expect(t.string('132.4535415')).toBe('132.4535415');
        });
        it('converts negative strings', () => {
          expect(t.string('-132.4535415')).toBe('-132.4535415');
        });
      });

      describe('converts boolean strings', () => {
        it('converts true', () => {
          expect(t.string('true')).toBe('true');
        });
        it('converts false', () => {
          expect(t.string('false')).toBe('false');
        });
      });

      it('converts none strings', () => {
        expect(t.string('')).toBe('');
      });
    });

    describe('from number', () => {
      it('converts integers', () => {
        expect(t.string(56)).toBe('56');
      });
      it('converts decimals', () => {
        expect(t.string(56.656)).toBe('56.656');
      });
      it('converts negatives', () => {
        expect(t.string(-152)).toBe('-152');
      });
      it('converts decimals with no significant digits', () => {
        expect(t.string(5.0)).toBe('5');
      });
      it('converts zero', () => {
        expect(t.string(0)).toBe('0');
      });
    });

    describe('from boolean', () => {
      it('converts true', () => {
        expect(t.string(true)).toBe('true');
      });

      it('converts false', () => {
        expect(t.string(false)).toBe('false');
      });
    });

    it('fails on nulls', () => {
      expect(() => t.string(null)).toThrowError();
    });

    it('fails on undefineds', () => {
      expect(() => t.string(undefined)).toThrowError();
    });

    describe('from object', () => {
      it('fails on none object', () => {
        expect(() => t.string({})).toThrowError();
      });

      it('fails on object containing strings', () => {
        expect(() => t.string({ string: 'lol' })).toThrowError();
      });
    });

    describe('from array', () => {
      it('fails on none array', () => {
        expect(() => t.string([])).toThrowError();
      });

      it('fails on array with strings', () => {
        expect(() => t.string(['lol'])).toThrowError();
      });
    });

    describe('from function', () => {
      it('fails on function returning undefined', () => {
        expect(() => t.string(() => undefined)).toThrowError();
      });
      it('fails on function returning null', () => {
        expect(() => t.string(() => null)).toThrowError();
      });
      it('fails on function returning conversion to string', () => {
        expect(() =>
          t.string(() => ({
            string: 'lol'
          }))
        ).toThrowError();
      });
      it('fails on function returning string', () => {
        expect(() => t.string(() => 'hey')).toThrowError();
      });
    });
  });

  it('Empty passes null values', () => {
    expect(t.none(null, [], {})).toBe(null);
  });
  it('Empty passes undefind values', () => {
    expect(t.none(undefined, [], {})).toBe(undefined);
  });
  it('Empty throws on non-null / non-undefined values', () => {
    expect(() => t.none(false, [], {})).toThrow();
  });
});
