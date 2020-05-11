import { Converter, ConverterFunction, createConverter } from '../converter';
import {
  ConverterResult,
  failed,
  FailedResult,
  success,
  SuccessfulResult
} from '../converter-result';
import { ConverterError } from '../errors';
import { Node, PresentNode } from '../nodes';
import { ContainerConverter } from './container-converter';
import { flatMap } from '../util';

class ArrayConverter<Element> extends ContainerConverter<Array<Element>, unknown> {
  public readonly name: string;
  public readonly element: Converter<Element, unknown>;

  constructor(element: Converter<Element, unknown>) {
    super();
    this.element = element;
    this.name = `Array<${element.name}>`;
  }

  protected tryConvertPresentNode(
    node: PresentNode<unknown>
  ): ConverterResult<Node<Array<Element>>> {
    if (!Array.isArray(node.value)) {
      return failed(new ConverterError(node.path, 'Array', node.value));
    } else {
      const results = node.value.map((v, i) => this.element.tryConvertNode(node.child(i, v)));
      const allSuccess = results.every(({ success }) => success);
      if (allSuccess) {
        const resultValue: Element[] = [];
        (results as SuccessfulResult<Node<Element>>[]).forEach(({ value }, i) => {
          if (!value.isMissingValue) {
            resultValue[i] = value.value;
          }
        });
        return success(node.setValue(resultValue));
      } else {
        return failed(
          ...flatMap(
            results.filter((r): r is FailedResult => !r.success),
            ({ errors }: FailedResult) => errors
          )
        );
      }
    }
  }
}

/**
 * A Array<T> converter
 * @param converter the converter to use for values of the array.
 */
export function array<T>(
  converter: ConverterFunction<T, unknown>
): ContainerConverter<T[], unknown> {
  return new ArrayConverter(createConverter(converter));
}
