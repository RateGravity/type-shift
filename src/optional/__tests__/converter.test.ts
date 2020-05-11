import {
  OptionalConverter,
  Node,
  ConverterResult,
  success,
  rootNode,
  missingRootNode,
  Converter
} from 'type-shift';

describe('OptionalConverter', () => {
  const converter = new (class extends OptionalConverter<unknown, unknown> {
    public readonly name = 'optional test';
    tryConvertNode(node: Node<unknown>): ConverterResult<Node<unknown>> {
      return success(node.setMissingValue());
    }
  })();

  it('returns empty values', () => {
    expect(converter.tryConvertNode(rootNode(5))).toMatchObject({
      success: true,
      value: {
        isMissingValue: true
      }
    });
  });

  it('fails on empty values if required', () => {
    expect(converter.required.tryConvertNode(rootNode(5))).toMatchObject({
      success: false,
      errors: [{ expected: 'required optional test' }]
    });
  });

  it('returns default value if missing', () => {
    expect(converter.defaultIfMissing(5).tryConvertNode(missingRootNode())).toMatchObject({
      success: true,
      value: {
        value: 5
      }
    });
  });

  it('runs default function if value is missing', () => {
    expect(converter.defaultIfMissing(() => 7).tryConvertNode(missingRootNode())).toMatchObject({
      success: true,
      value: {
        value: 7
      }
    });
  });

  it('runs default converter if value is missing', () => {
    expect(
      converter
        .defaultIfMissing(
          new (class extends Converter<5, unknown> {
            public readonly name = 'five';
            public tryConvertNode(n: Node<unknown>): ConverterResult<Node<5>> {
              return success(n.setValue(5));
            }
          })()
        )
        .tryConvertNode(missingRootNode())
    ).toMatchObject({
      success: true,
      value: {
        value: 5
      }
    });
  });
});
