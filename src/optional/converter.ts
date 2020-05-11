import { Converter, DefaultConverterFunction, createDefaultConverter } from '../converter';
import { ConverterResult, success } from '../converter-result';
import { ConverterError } from '../errors';
import { Node } from '../nodes';

/**
 * Optional Converters will potentially return Missing Nodes
 * When calling tryConvertNode.
 */
export abstract class OptionalConverter<Result, Input> extends Converter<Result, Input> {
  /**
   * Returns a required version of this converter
   * first calls this converter and if the result is missing
   * returns a failed result
   */
  public get required(): Converter<Result, Input> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const c = this;
    return new (class extends Converter<Result, Input> {
      public readonly name = `required ${c.name}`;
      public tryConvertNode(node: Node<Input>): ConverterResult<Node<Result>> {
        const result = c.tryConvertNode(node);
        if (result.success) {
          return result.value.ifPresent(result, (n) => ({
            success: false,
            errors: [new ConverterError(n.path, this.name)]
          }));
        } else {
          return result;
        }
      }
    })();
  }

  public defaultIfMissing(converter: DefaultConverterFunction<Result>): Converter<Result, Input> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const c = this;
    const d = createDefaultConverter(converter);
    return this.pipe(
      new (class extends Converter<Result, Result> {
        public readonly name = `${c.name} default ${d.name}`;
        public tryConvertNode(node: Node<Result>): ConverterResult<Node<Result>> {
          return node.ifPresent(success(node), (n) => d.tryConvertNode(n));
        }
      })(),
      `${c.name} default ${d.name}`
    );
  }
}
