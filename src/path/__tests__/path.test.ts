import * as t from 'type-shift';

describe('path', () => {
  it('converts from path on entity', () => {
    const c = t.path`$.test[0]`;

    expect(c.convert({ test: ['1', '0'] })).toBe('1');
  });

  it('resolves paths that dont exist as missing', () => {
    const c = t.path`$.foo[0].bar`;
    expect(c.tryConvertNode(t.rootNode({}))).toMatchObject({
      success: true,
      value: {
        isMissingValue: true
      }
    });
  });

  it('resolves itself', () => {
    const testConverter = t.array(t.path`@.value`.pipe(t.number));
    const testItem = [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }];
    expect(testConverter.convert(testItem)).toMatchObject([0, 1, 2, 3]);
  });

  it('resolves its own children', () => {
    const testConverter = t.shape({
      cloneA: t.path`@.a`.pipe(t.string)
    });
    const testItem = { cloneA: { a: 'testA' } };
    expect(testConverter.convert(testItem)).toEqual({
      cloneA: 'testA'
    });
  });

  it('resolves adjacent values at base level', () => {
    const testConverter = t.shape({
      a: t.string,
      cloneA: t.path`^.a`.pipe(t.string)
    });
    const testItem = { a: 'testA' };
    expect(testConverter.convert(testItem)).toEqual({
      a: 'testA',
      cloneA: 'testA'
    });
  });

  it('resolves deep objects', () => {
    const testConverter = t.path`$..value`.pipe(t.array(t.number));
    expect(
      testConverter.convert({
        a: [
          { name: 'test', value: 1 },
          { name: 'other', value: 2 }
        ],
        b: [{ name: 'test', value: 3 }],
        value: 4,
        c: { value: 5 }
      })
    ).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
  });

  it('matches all array elements', () => {
    const c = t.path`$.values[*]`;
    expect(
      c.convert({
        values: [1, 2, '3', { values: 4 }]
      })
    ).toEqual([1, 2, '3', { values: 4 }]);
  });

  it('matches all path elements', () => {
    const c = t.path`$.*`;
    expect(
      c.convert({
        a: [1, 2, 3],
        b: { value: '4' },
        c: false
      })
    ).toEqual([[1, 2, 3], { value: '4' }, false]);
  });

  it('matches multiple array elements', () => {
    const c = t.path`$[0,2]`;
    expect(c.convert([1, 2, 3])).toEqual([1, 3]);
  });

  it('matches multiple object elements', () => {
    const c = t.path`$['foo', 'bar']`;
    expect(c.convert({ foo: 'fighter', bar: 'taco', baz: 'luhrmann' })).toEqual([
      'fighter',
      'taco'
    ]);
  });

  it('predicate matches values', () => {
    const predicate = jest.fn((v) => v > 5);
    const c = t.path`$[${predicate}]`;
    expect(c.convert([4, 5, 6, 7])).toEqual([6, 7]);
    expect(predicate.mock.calls).toEqual([
      [4, 0, [4, 5, 6, 7]],
      [5, 1, [4, 5, 6, 7]],
      [6, 2, [4, 5, 6, 7]],
      [7, 3, [4, 5, 6, 7]]
    ]);
  });

  it('slices an array', () => {
    // start 0, end 4, step 2
    const c = t.path`$[:4:2]`;
    expect(c.convert([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([1, 3]);
  });

  it('fails when required on missing paths', () => {
    const c = t.path`$.missing`.required;
    expect(c.tryConvert({ present: true })).toMatchObject({ success: false });
  });

  it('navigates deeply across properties', () => {
    const c = t.path`$.*[1:3]..bar`;
    const result = c.convert({
      foo: [0, { obj: { bar: 5 }, bar: 6 }, { bar: 7 }],
      bar: [0, 1, 2, 3],
      baz: [{ bar: 87 }, [{ bar: 76 }, { bar: 52 }]]
    });
    expect(result).toEqual(expect.arrayContaining([6, 7, 5, 76, 52]));
  });

  it('returns arrays from match expressions even if there is only one match', () => {
    const c = t.path`$.*`;
    expect(c.convert({ foo: 5 })).toEqual([5]);
  });

  it('allows string substitutions for keys', () => {
    const c = t.path`$.${'867273'}`;
    expect(
      c.convert({
        ['867273']: 5
      })
    ).toBe(5);
  });

  it('allows number substitutions for slices', () => {
    const start = 5;
    const end = 0;
    const step = -1;
    const c = t.path`$[${start}:${end}:${step}]`;
    expect(c.convert([1, 2, 3, 4, 5, 6, 7])).toEqual([6, 5, 4, 3, 2]);
  });

  it('allows missing slice args', () => {
    const c = t.path`$[0:]`;
    expect(c.convert([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('allows negative indexing from the back of an array', () => {
    const c = t.path`$[-1]`;
    expect(c.convert([1, 2, 3, 4])).toBe(4);
  });

  it('allows arrays for multiple value indexing', () => {
    const c = t.path`$[${[1, 2, 3]}, -1]`;
    expect(c.convert([1, 2, 3, 4])).toEqual([2, 3, 4, 4]);
  });
});
