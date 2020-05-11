import { BracketedNavigation, rootNode } from 'type-shift';

describe('BracketedNavigation', () => {
  it('finds all array elements', () => {
    const n = new BracketedNavigation([0, 2, 3]);
    const r = n.navigate(rootNode([0, 1, 2, 3, 4]));
    expect(r).toMatchObject({
      value: [0, 2, 3]
    });
  });

  it('finds all object elements', () => {
    const n = new BracketedNavigation(['foo', 'bar']);
    const r = n.navigate(rootNode({ foo: 'fighter', bar: 'taco' }));
    expect(r).toMatchObject({
      value: ['fighter', 'taco']
    });
  });

  it('allows negative indexing', () => {
    const n = new BracketedNavigation([-1]);
    const r = n.navigate(rootNode([1, 2]));
    expect(r).toMatchObject({
      value: 2
    });
  });
});
