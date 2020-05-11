import { createConverter, ConverterFunction, Converter } from '../converter';
import { ConverterResult, success } from '../converter-result';
import { OptionalConverter } from './converter';
import { Node } from '../nodes';

class WrappedOptionalConverter<Result, Input> extends OptionalConverter<Result, Input> {
  public readonly name: string;
  private readonly convertIfPresent: Converter<Result, Input>;

  constructor(convertIfPresent: Converter<Result, Input>) {
    super();
    this.convertIfPresent = convertIfPresent;
    this.name = `optional ${convertIfPresent.name}`;
  }

  public tryConvertNode(node: Node<Input>): ConverterResult<Node<Result>> {
    return node.ifPresent(
      (n) => this.convertIfPresent.tryConvertNode(n),
      success(node as Node<Result>)
    );
  }
}

/**
 * Given a converter return an Optional Converter
 * that passes the missing value around the inner converter.
 */
export function optional<Result, Input>(
  converter: ConverterFunction<Result, Input>
): OptionalConverter<Result, Input> {
  return new WrappedOptionalConverter(createConverter(converter));
}
