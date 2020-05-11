import { Converter } from './converter';
import { ConverterResult, failed, success } from './converter-result';
import { ConverterError } from './errors';
import { Node } from './nodes';

class NeverConverter extends Converter<never, unknown> {
  public readonly name = 'never';

  public tryConvertNode(input: Node<unknown>): ConverterResult<Node<never>> {
    return input.ifPresent(
      (n) => failed(new ConverterError(n.path, 'never', n.value)),
      (n) => success(n as Node<never>)
    );
  }
}

/**
 * The Never converter only allows missing values to pass through
 * This is useful if you want to for instance assert that a key is
 * never present on an object, or if an array contains no values.
 */
const neverConverter = new NeverConverter();

export { neverConverter as never };
