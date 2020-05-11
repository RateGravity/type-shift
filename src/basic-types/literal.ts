import { formatValue } from '../format-value';
import { ConverterResult, success, failed } from '../converter-result';
import { ConverterError } from '../errors';
import { Node, PresentNode } from '../nodes';
import { BasicConverter } from './basic-converter';

class LiteralConverter<
  T extends string | number | boolean | null | undefined
> extends BasicConverter<T, unknown> {
  public readonly name: string;
  private readonly value: T;

  constructor(value: T) {
    super();
    this.name = formatValue(value);
    this.value = value;
  }

  protected tryConvertPresentNode(input: PresentNode<unknown>): ConverterResult<Node<T>> {
    if (input.value === this.value) {
      return success(input as Node<T>);
    }
    return failed(new ConverterError(input.path, this.name, input.value));
  }
}

const nullConverter = new LiteralConverter(null);
const undefinedConverter = new LiteralConverter(undefined);

export { nullConverter as null, undefinedConverter as undefined };

/**
 * Create a converter that ensures that the value is equal to (===) the given value.
 */
export function literal<T extends string | number | boolean | null | undefined>(
  value: T
): BasicConverter<T, unknown> {
  return new LiteralConverter(value);
}
