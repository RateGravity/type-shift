import { ConverterResult, success } from './converter-result';
import { Node, PresentNode } from './nodes';
import { RequiredConverter } from './required';

class UnknownConverter extends RequiredConverter<unknown, unknown> {
  public readonly name = 'unknown';

  protected tryConvertPresentNode(input: PresentNode<unknown>): ConverterResult<Node<unknown>> {
    return success(input);
  }
}

/**
 * The Unknown converter allows any non-missing values to pass through
 * it is the opposite of the never converter. This is useful when you want
 * to assert for presence but nothing else.
 *
 * If you want a value that truly does no checking you can wrap this
 * converter in an optional eg. `t.optional(t.unknown)` which will allow
 * all values, including missing values to pass through.
 */
const unknownConverter = new UnknownConverter();

export { unknownConverter as unknown };
