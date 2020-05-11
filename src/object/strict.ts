import { Converter, createConverter, ConverterFunction } from '../converter';
import {
  ConverterResult,
  success,
  SuccessfulResult,
  FailedResult,
  failed
} from '../converter-result';
import { ConverterError } from '../errors';
import { ObjectConverter } from './object-converter';
import { optional } from '../optional';
import { PresentNode, Node } from '../nodes';
import { mapValues, values, filterValues, flatMap } from '../util';

export class StrictConverter<Result extends object> extends ObjectConverter<Result> {
  public readonly name: string;
  public readonly converters: { [K in keyof Result]-?: Converter<Result[K], unknown> };

  constructor(converters: { [K in keyof Result]-?: Converter<Result[K], unknown> }) {
    super();
    this.name = Array.isArray(converters)
      ? `[${converters.map((c) => c.name).join(', ')}]`
      : `{${Object.keys(converters)
          .map((key) => `${key}: ${(converters as any)[key].name}`)
          .join(', ')}}`;
    this.converters = converters;
  }

  protected tryConvertPresentNode(input: PresentNode<unknown>): ConverterResult<Node<Result>> {
    if (input.value === null || typeof input.value !== 'object') {
      return failed(new ConverterError(input.path, 'object', input.value));
    }
    const results = mapValues(this.converters, (converter: Converter<any, unknown>, key) => {
      if (key in (input.value as object)) {
        return converter.tryConvertNode(
          input.child(key as string | number, (input.value as any)[key])
        );
      } else {
        return converter.tryConvertNode(input.missingChild(key as string | number));
      }
    });
    if (
      (values(results) as Array<ConverterResult<Node<unknown>>>).every(({ success }) => success)
    ) {
      return success(
        input.setValue(
          (mapValues(
            filterValues(results, (v) => !(v as SuccessfulResult<Node<any>>).value.isMissingValue),
            (v) => (v as SuccessfulResult<PresentNode<any>>).value.value
          ) as unknown) as Result
        )
      );
    } else {
      return failed(
        ...flatMap(
          (values(results) as Array<ConverterResult<Node<unknown>>>).filter(
            (r): r is FailedResult => !r.success
          ),
          ({ errors }: FailedResult) => errors
        )
      );
    }
  }

  public get partial(): ObjectConverter<Partial<Result>> {
    return new StrictConverter<Partial<Result>>(
      mapValues(this.converters, (c) => optional(c)) as any
    );
  }
}

export function strict<Result extends object>(
  converters: { [K in keyof Result]-?: ConverterFunction<Result[K], unknown> }
): StrictConverter<Result> {
  return new StrictConverter(
    mapValues(converters, (c) => createConverter(c)) as {
      [K in keyof Result]-?: Converter<Result[K], unknown>;
    }
  );
}
