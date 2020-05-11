import { optional, missingRootNode, rootNode } from 'type-shift';

describe('optional converters', () => {
  it('allows missing values', () => {
    const c = optional(() => 1);
    expect(c.tryConvertNode(missingRootNode())).toMatchObject({
      success: true,
      value: missingRootNode()
    });
  });
  it('on not missing passes through value', () => {
    const inner = jest.fn(() => 1);
    optional(inner).tryConvertNode(rootNode(3));
    expect(inner).toHaveBeenCalledWith(3);
  });
});
