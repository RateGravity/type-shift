import { Converter } from './converter';
import { ConverterResult, failed } from './converter-result';
import { ConverterError } from './errors';
import { Node, PresentNode } from './nodes';

export abstract class RequiredConverter<Result, Input> extends Converter<Result, Input> {
  protected abstract tryConvertPresentNode(
    input: PresentNode<Input>
  ): ConverterResult<Node<Result>>;

  public tryConvertNode(input: Node<Input>): ConverterResult<Node<Result>> {
    return input.ifPresent(
      (n) => this.tryConvertPresentNode(n),
      (n) => failed(new ConverterError(n.path, this.name))
    );
  }
}
