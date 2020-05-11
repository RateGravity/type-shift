import { SliceNavigation, rootNode } from 'type-shift';

describe('SliceNavigation', () => {
  it('uses defaults for all values', () => {
    const n = new SliceNavigation(undefined, undefined, undefined);
    const r = n.navigate(rootNode([1, 2, 3]));
    expect(r).toMatchObject({ value: [1, 2, 3] });
  });
  it('allows negative values to specify distance from end of array', () => {
    const n = new SliceNavigation(-3, -1, undefined);
    const r = n.navigate(rootNode([1, 2, 3]));
    expect(r).toMatchObject({ value: [1, 2] });
  });
  it('iterates backwards with negative step', () => {
    const n = new SliceNavigation(2, 0, -1);
    const r = n.navigate(rootNode([1, 2, 3]));
    expect(r).toMatchObject({ value: [3, 2] });
  });
});
