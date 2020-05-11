import { DeepNavigation, rootNode } from 'type-shift';

describe('DeepNavigation', () => {
  it('resolves deep objects', () => {
    const n = new DeepNavigation('value');
    expect(
      n.navigate(
        rootNode({
          a: [
            { name: 'test', value: 1 },
            { name: 'other', value: 2 }
          ],
          b: [{ name: 'test', value: 3 }],
          value: 4,
          c: { value: 5 }
        })
      )
    ).toMatchObject({
      value: [4, 5, 1, 2, 3]
    });
  });
});
