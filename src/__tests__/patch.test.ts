import * as t from 'type-shift';

describe('patch', () => {
  describe('given a narrowed field', () => {
    const converter = t.strict({
      count: t.oneOf([-1, 0, 1])
    });
    const patched = t.patch(
      ['count'],
      t.number.pipe((v) => (v < 0 ? -1 : v > 0 ? 1 : 0))
    )(converter);

    it('allows narrowing of field', () => {
      const result = patched({ count: -2 });
      expect(result).toEqual({ count: -1 });
    });
    it('skips conversion if type is wrong', () => {
      expect(() => patched({ count: 'test' })).toThrow(
        'At Path $.count, expected -1 | 0 | 1 but was "test"'
      );
    });
  });

  describe('given a legacy field', () => {
    const converter = t.strict({
      items: t.strict({
        data: t.array(t.strict({ name: t.string })),
        count: t.number
      })
    });
    const patchedItems = t.patch(
      ['items'],
      t.undefined.pipe(t.forPath([t.ParentPath, 'count'])).pipe((count) => ({ data: [], count }))
    )(converter);

    const pathcedCount = t.patch(
      ['items', 'count'],
      t.undefined.pipe(t.forPath([t.ParentPath, t.ParentPath, 'count']))
    )(converter);

    const chainedPatch = t.patches(
      t.patch(['items', 'data'], t.undefined.pipe(t.forPath([t.ParentPath], t.array(t.unknown)))),
      t.patch(
        ['items', 'count'],
        t.undefined
          .pipe(t.forPath([t.ParentPath, 'data'], t.array(t.unknown)))
          .pipe((d) => d.length)
      )
    )(converter);

    it('uses value from legacy field', () => {
      const result = patchedItems({ count: 0 });
      expect(result).toEqual({ items: { count: 0, data: [] } });
    });

    it('deeply sets value', () => {
      const result = pathcedCount({ items: { data: [] }, count: 0 });
      expect(result).toEqual({ items: { data: [], count: 0 } });
    });

    it('chains multiple transforms', () => {
      const result = chainedPatch({ items: [{ name: 'test' }] });
      expect(result).toEqual({
        items: {
          data: [{ name: 'test' }],
          count: 1
        }
      });
    });
  });

  describe('given collection types, patches all elements', () => {
    const converter = t.strict({
      sorted: t.array(
        t.strict({
          id: t.string
        })
      ),
      lookup: t.record(
        t.strict({
          name: t.string
        })
      )
    });

    const stringToIdObject = t.patch(
      ['sorted', t.AllElements, 'id'],
      t.forPath([t.ParentPath], t.string)
    )(converter);

    it('converts all elements in array', () => {
      const result = stringToIdObject({ sorted: ['1', '2', '3', '4'], lookup: {} });
      expect(result).toEqual({
        sorted: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
        lookup: {}
      });
    });

    it('creates empty array if not present', () => {
      const result = stringToIdObject({ sorted: null, lookup: {} });
      expect(result).toEqual({
        sorted: [],
        lookup: {}
      });
    });

    const firstLastToName = t.patch(
      ['lookup', t.AllEntries, 'name'],
      t.compose(
        [
          t.forPath([t.ParentPath, 'firstName'], t.string),
          t.forPath([t.ParentPath, 'lastName'], t.string)
        ],
        (first: string, last: string) => `${first} ${last}`
      )
    )(converter);

    it('converts all elements in the record', () => {
      const result = firstLastToName({
        sorted: [],
        lookup: {
          a: { firstName: 'Test', lastName: 'McTester' },
          b: { firstName: 'Failing', lastName: 'Tester' }
        }
      });
      expect(result).toEqual({
        sorted: [],
        lookup: {
          a: { name: 'Test McTester' },
          b: { name: 'Failing Tester' }
        }
      });
    });

    it('creates empty record if not present', () => {
      const result = firstLastToName({
        sorted: [],
        lookup: null
      });
      expect(result).toEqual({
        sorted: [],
        lookup: {}
      });
    });
  });
});
