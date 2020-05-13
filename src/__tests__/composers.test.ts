import * as t from 'type-shift';

describe('compose', () => {
  const composerTest = <T extends { composed: string }>(
    testItem: unknown,
    expected: string,
    converter: t.Converter<T, unknown>
  ) => expect(converter(testItem).composed).toBe(expected);

  it('works with a single converter', () => {
    composerTest(
      { a: 'testA' },
      'testA',
      t.shape({
        a: t.string,
        composed: t.compose([t.forPath(['a'], t.string)], (a: string) => `${a}`)
      })
    );
  });

  it('combines two converters', () => {
    composerTest(
      { a: 'testA', b: 'testB' },
      'testA,testB',
      t.shape({
        a: t.string,
        b: t.string,
        composed: t.compose(
          [t.forPath(['a'], t.string), t.forPath(['b'], t.string)],
          (a: string, b: string) => `${a},${b}`
        )
      })
    );
  });

  it('combines three converters', () => {
    composerTest(
      { a: 'testA', b: 'testB', c: 'testC' },
      'testA,testB,testC',
      t.shape({
        a: t.string,
        b: t.string,
        c: t.string,
        composed: t.compose(
          [t.forPath(['a'], t.string), t.forPath(['b'], t.string), t.forPath(['c'], t.string)],
          (a: string, b: string, c: string) => `${a},${b},${c}`
        )
      })
    );
  });

  it('combines an arbitrary number of converters', () => {
    composerTest(
      { a: 'testA', b: 'testB', c: 'testC', d: 'testD', e: 'testE', f: 'testF' },
      'testA,testB,testC,testD,testE,testF',
      t.shape({
        a: t.string,
        b: t.string,
        c: t.string,
        d: t.string,
        e: t.string,
        f: t.string,
        composed: t.compose(
          [
            t.forPath(['a'], t.string),
            t.forPath(['b'], t.string),
            t.forPath(['c'], t.string),
            t.forPath(['d'], t.string),
            t.forPath(['e'], t.string),
            t.forPath(['f'], t.string)
          ],
          (a: string, b: string, c: string, d: string, e: string, f: string) =>
            `${a},${b},${c},${d},${e},${f}`
        )
      })
    );
  });
});
