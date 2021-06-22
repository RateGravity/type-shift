import * as t from 'type-shift';

describe('forPath', () => {
  it('converts from path on entity', () => {
    expect(t.forPath(['test', 0], t.string)({ test: ['1', '0'] })).toBe('1');
  });

  it('resolves paths that dont exist as undefined', () => {
    const pathConverter = t.forPath(['foo', 0, 'bar']);
    expect(pathConverter({}, [], {})).toBe(undefined);
  });

  describe('resolves relative paths', () => {
    it('resolves itself', () => {
      const testConverter = t.array(t.forPath([t.CurrentPath, 'value'], t.number));
      const testItem = [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }];
      expect(testConverter(testItem)).toMatchObject([0, 1, 2, 3]);
    });

    it('resolves its own children', () => {
      const testConverter = t.shape({
        cloneA: t.forPath([t.CurrentPath, 'a'], t.string)
      });
      const testItem = { cloneA: { a: 'testA' } };
      expect(testConverter(testItem).cloneA).toBe(testItem.cloneA.a);
    });

    it('resolves adjacent values at base level', () => {
      const testConverter = t.shape({
        a: t.string,
        cloneA: t.forPath([t.ParentPath, 'a'], t.string)
      });
      const testItem = { a: 'testA' };
      expect(testConverter(testItem).cloneA).toBe(testItem.a);
    });

    it('resolves adjacent values at sub-level', () => {
      const testConverter = t.shape({
        child: t.shape({
          a: t.string,
          cloneA: t.forPath([t.ParentPath, 'a'], t.string)
        })
      });
      const testItem = { child: { a: 'testA' } };
      expect(testConverter(testItem).child.cloneA).toBe(testItem.child.a);
    });

    it('resolves upper-level values', () => {
      const testConverter = t.shape({
        a: t.string,
        child: t.shape({
          cloneA: t.forPath([t.ParentPath, t.ParentPath, 'a'], t.string)
        })
      });
      const testItem = { a: 'testA', child: {} };
      expect(testConverter(testItem).child.cloneA).toBe(testItem.a);
    });

    it('resolves deep upper-level values', () => {
      const testConverter = t.shape({
        a: t.string,
        child: t.shape({
          child: t.shape({
            child: t.shape({
              cloneA: t.forPath(
                [t.ParentPath, t.ParentPath, t.ParentPath, t.ParentPath, 'a'],
                t.string
              )
            })
          })
        })
      });
      const testItem = { a: 'testA', child: { child: { child: {} } } };
      expect(testConverter(testItem).child.child.child.cloneA).toBe(testItem.a);
    });

    it('resolves neighboring values', () => {
      const testConverter = t.shape({
        childA: t.shape({
          a: t.string
        }),
        childB: t.shape({
          cloneA: t.forPath([t.ParentPath, t.ParentPath, 'childA', 'a'], t.string)
        })
      });
      const testItem = { childA: { a: 'testA' }, childB: {} };
      expect(testConverter(testItem).childB.cloneA).toBe(testItem.childA.a);
    });

    it('resolves deep neighboring values', () => {
      const testConverter = t.shape({
        childA: t.shape({
          childB: t.shape({
            a: t.string
          }),
          childC: t.shape({
            cloneA: t.forPath([t.ParentPath, t.ParentPath, 'childB', 'a'], t.string)
          })
        })
      });
      const testItem = { childA: { childB: { a: 'testA' }, childC: {} } };
      expect(testConverter(testItem).childA.childC.cloneA).toBe(testItem.childA.childB.a);
    });

    it('resolves all-encompassing values', () => {
      const testConverter = t.shape({
        childA: t.shape({
          childB: t.shape({
            cloneAll: t.forPath(
              [t.ParentPath, t.ParentPath, t.ParentPath],
              t.shape({
                childA: () => 'hey'
              })
            )
          })
        })
      });
      const testItem = { childA: { childB: {} } };
      expect(testConverter(testItem).childA.childB.cloneAll).toMatchObject({ childA: 'hey' });
    });

    it('resolves immediate parent', () => {
      const testConverter = t.strict({
        child: t.strict({
          subChild: t.forPath([t.ParentPath], t.shape({ sibling: t.string }))
        })
      });
      const testItem = { child: { sibling: 'test' }};
      expect(testConverter(testItem)).toMatchObject({
        child: {
          subChild: { sibling: 'test' }
        }
      });
    })

    it("still resolves '.'", () => {
      const testConverter = t.shape({
        '.': t.string,
        dotClone: t.forPath(['.'], t.string)
      });
      const testItem = { '.': 'testA' };
      expect(testConverter(testItem)['.']).toBe(testItem['.']);
    });

    it("still resolves '..'", () => {
      const testConverter = t.shape({
        '..': t.string,
        dotDotClone: t.forPath(['..'], t.string)
      });
      const testItem = { '..': 'testB' };
      expect(testConverter(testItem)['..']).toBe(testItem['..']);
    });
  });
});

describe('subConverter', () => {
  it('creates a new entity root', () => {
    const converter = jest.fn(() => 1);
    const s = t.strict({
      foo: t.sub(converter)
    });
    s({ foo: '1234' }, ['bar'], { bar: { foo: '1234' } });
    expect(converter).toHaveBeenCalledWith('1234', [], '1234');
  });
  it('re-roots all errors', () => {
    const s = t.strict({
      foo: t.strict({
        bar: t.sub(
          t.strict({
            baz: t.never
          })
        )
      })
    });
    try {
      s({ foo: { bar: { baz: '1234' } } });
      fail();
    } catch (err) {
      expect(err).toMatchObject({
        errorFields: {
          '$.foo.bar.baz': { actual: '"1234"', expected: 'never' }
        }
      });
    }
  });
});
