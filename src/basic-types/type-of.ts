import { ConverterResult, success, failed } from '../converter-result';
import { ConverterError } from '../errors';
import { Node, PresentNode } from '../nodes';
import { BasicConverter } from './basic-converter';

class TypeOfConverter<T> extends BasicConverter<T, unknown> {
  public readonly name: string;

  constructor(typeOf: string) {
    super();
    this.name = typeOf;
  }

  protected tryConvertPresentNode(input: PresentNode<unknown>): ConverterResult<Node<T>> {
    if (typeof input.value === this.name) {
      return success(input as Node<T>);
    }
    return failed(new ConverterError(input.path, this.name, input.value));
  }
}

const numberConverter = new TypeOfConverter<number>('number');
const stringConverter = new TypeOfConverter<string>('string');
const booleanConverter = new TypeOfConverter<boolean>('boolean');

export { numberConverter as number, stringConverter as string, booleanConverter as boolean };
