import { RequiredConverter } from '../required';
import { ConverterResult } from '../converter-result';
import { Node, PresentNode } from '../nodes';

export abstract class BasicConverter<Result, Input> extends RequiredConverter<Result, Input> {
  /**
   * Creates a new BasicConverter as a union of two types
   * For instance t.string.or(t.number). The implementation trys
   * conversions in the order they are defined.
   */
  public or<Other>(converter: BasicConverter<Other, Input>): BasicConverter<Result | Other, Input> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const s = this;
    return new (class extends BasicConverter<Result | Other, Input> {
      public readonly name = `${s.name} | ${converter.name}`;
      public tryConvertPresentNode(
        input: PresentNode<Input>
      ): ConverterResult<Node<Result | Other>> {
        const r1 = s.tryConvertNode(input);
        if (r1.success) {
          return r1;
        }
        return converter.tryConvertNode(input);
      }
    })();
  }
}
