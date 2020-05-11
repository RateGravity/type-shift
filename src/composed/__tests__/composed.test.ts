import * as t from 'type-shift';

describe('compose', () => {
  it('works with a single converter', () => {
    const c = t.compose([t.path`$.a`.pipe(t.string)], (a: string) => a + a);
    expect(c.tryConvert({ a: 'testA' })).toMatchObject({ success: true, value: 'testAtestA' });
  });

  it('combines two converters', () => {
    const c = t.compose(
      [t.path`$.a`.pipe(t.string), t.path`$.b`.pipe(t.string)],
      (a: string, b: string) => `${a},${b}`
    );
    expect(c.tryConvert({ a: 'testA', b: 'testB' })).toMatchObject({
      success: true,
      value: 'testA,testB'
    });
  });

  it('combines an arbitrary number of converters', () => {
    const c = t.compose(
      [
        t.path`$.a`.pipe(t.string),
        t.path`$.b`.pipe(t.string),
        t.path`$.c`.pipe(t.string),
        t.path`$.d`.pipe(t.string),
        t.path`$.e`.pipe(t.string),
        t.path`$.f`.pipe(t.string)
      ],
      (...args: string[]) => args.join(',')
    );
    expect(
      c.tryConvert({
        a: 'testA',
        b: 'testB',
        c: 'testC',
        d: 'testD',
        e: 'testE',
        f: 'testF'
      })
    ).toMatchObject({
      success: true,
      value: 'testA,testB,testC,testD,testE,testF'
    });
  });

  it('fails if one of the inputs fails', () => {
    const c = t.compose(
      [t.path`$.a`.pipe(t.string), t.path`$.b`.pipe(t.string)],
      (a: string, b: string) => a + b
    );
    expect(c.tryConvert({ a: 5, b: '5' })).toMatchObject({ success: false });
  });

  it('fails if one of the values in missing', () => {
    const c = t.compose([t.path`$.a`, t.path`$.b`], (a: unknown, b: unknown) => `${a}${b}`);
    expect(c.tryConvert({ b: '5' })).toMatchObject({ success: false });
  });

  describe('returns failures from the composer', () => {
    it('Converter Error', () => {
      const c = t.compose([t.string], (a: string) => {
        throw new t.ConverterError('$.foo', 'number', a);
      });
      expect(c.tryConvert('test')).toMatchObject({
        success: false,
        errors: [{ path: '$.foo', expected: 'number', actual: 'test' }]
      });
    });

    it('Converter Errors', () => {
      const c = t.compose([t.string], (a: string) => {
        throw new t.ConverterErrors([
          new t.ConverterError('$.foo', 'number', a),
          new t.ConverterError('$.bar', 'string', a)
        ]);
      });
      expect(c.tryConvert('test')).toMatchObject({
        success: false,
        errors: [
          { path: '$.foo', expected: 'number', actual: 'test' },
          { path: '$.bar', expected: 'string', actual: 'test' }
        ]
      });
    });

    it('Other Errors', () => {
      const c = t.compose([t.string], (_: string) => {
        throw new Error('foo');
      });
      expect(c.tryConvert('test')).toMatchObject({
        success: false,
        errors: [{ path: '$', expected: '(string) => unknown', actual: 'test' }]
      });
    });
  });
});
