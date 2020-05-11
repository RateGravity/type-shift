import { formatValue } from '../format-value';
import { ConverterResult, success, failed } from '../converter-result';
import { ConverterError } from '../errors';
import { Node, PresentNode } from '../nodes';
import { BasicConverter } from './basic-converter';

class OneOfConverter<T extends string | number | boolean | null | undefined> extends BasicConverter<
  T,
  unknown
> {
  public readonly name: string;
  private readonly values: Set<T>;

  constructor(values: T[]) {
    super();
    this.name = values.map(formatValue).join(' | ');
    this.values = new Set(values);
  }

  protected tryConvertPresentNode(input: PresentNode<unknown>): ConverterResult<Node<T>> {
    if (this.values.has(input.value as T)) {
      return success(input as Node<T>);
    }
    return failed(new ConverterError(input.path, this.name, input.value));
  }
}

/**
 * Creates a converter that ensures that the input is one of the given values.
 */
export function oneOf<T extends string | number | boolean | null | undefined>(
  ...values: T[]
): BasicConverter<T, unknown> {
  return new OneOfConverter(values);
}
