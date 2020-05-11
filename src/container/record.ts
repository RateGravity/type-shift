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
import { mapValues, values, filterValues, flatMap } from '../util';

class RecordConverter<Element> extends ContainerConverter<Record<string, Element>, unknown> {
  public readonly name: string;
  public readonly element: Converter<Element, unknown>;

  constructor(element: Converter<Element, unknown>) {
    super();
    this.element = element;
    this.name = `Record<string,${element.name}>`;
  }

  protected tryConvertPresentNode(
    node: PresentNode<unknown>
  ): ConverterResult<Node<Record<string, Element>>> {
    if (node.value === null || typeof node.value !== 'object' || Array.isArray(node.value)) {
      return fail(new ConverterError(node.path, 'object', node.value));
    } else {
      const results = mapValues(node.value!, (v: unknown, key: string) =>
        this.element.tryConvertNode(node.child(key, v))
      );
      if (values(results).every(({ success }) => success)) {
        return success(
          node.setValue(
            mapValues(
              filterValues(
                results,
                (v: SuccessfulResult<Node<Element>>) => !v.value.isMissingValue
              ),
              (v: SuccessfulResult<PresentNode<Element>>) => v.value.value
            ) as Record<string, Element>
          )
        );
      } else {
        return failed(
          ...flatMap(
            values(filterValues(results, (v: ConverterResult<Node<Element>>) => !v.success)),
            (v: FailedResult) => v.errors
          )
        );
      }
    }
  }
}

/**
 * A Record<string,T> converter
 * @param converter the converter to use for the values in the record
 */
export function record<T>(
  converter: ConverterFunction<T, unknown>
): ContainerConverter<Record<string, T>, unknown> {
  return new RecordConverter(createConverter(converter));
}
