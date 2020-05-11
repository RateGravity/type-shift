import { rootNode } from 'type-shift';

describe('Node', () => {
  it('root node has path $', () => {
    const n = rootNode(5);
    expect(n.path).toBe('$');
  });

  it('child node has composed path', () => {
    const n = rootNode(5).child(2, 'two');
    expect(n.path).toBe('$[2]');
  });
});
