import {
  ConverterResult,
  RequiredConverter,
  PresentNode,
  Node,
  success,
  missingRootNode,
  rootNode
} from 'type-shift';

describe('RequiredConverter', () => {
  const converter = new (class extends RequiredConverter<5, unknown> {
    public readonly name = 'test converter';
    tryConvertPresentNode(node: PresentNode<unknown>): ConverterResult<Node<5>> {
      return success(node.setValue(5));
    }
  })();

  it('is an error if passed missing value', () => {
    expect(converter.tryConvertNode(missingRootNode())).toMatchObject({
      success: false,
      errors: [{ path: '$', expected: 'test converter' }]
    });
  });

  it('invokes tryConvertPresentNode when passed a value', () => {
    expect(converter.tryConvertNode(rootNode(18))).toMatchObject({
      success: true,
      value: {
        value: 5
      }
    });
  });
});
