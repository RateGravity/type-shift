import { Converter, createConverter, ConverterFunction } from '../converter';
import { ConverterResult, success, SuccessfulResult } from '../converter-result';
import { unknown as unknownConverter } from '../unknown';
import { ObjectConverter } from './object-converter';
import { optional } from '../optional';
import { PresentNode, Node } from '../nodes';
import { StrictConverter } from './strict';
import { record, array } from '../container';
import { mapValues, filterValues } from '../util';

class ShapeConverter<Result extends object> extends StrictConverter<Result> {
  private readonly otherKeyConverter: Converter<unknown, unknown>;

  constructor(
    converters: { [K in keyof Result]-?: Converter<Result[K], unknown> },
    otherKeyConverter: Converter<unknown, unknown>
  ) {
    super(converters);
    this.otherKeyConverter = otherKeyConverter;
  }

  protected tryConvertPresentNode(input: PresentNode<unknown>): ConverterResult<Node<Result>> {
    const declaredKeysResult = super.tryConvertPresentNode(input);
    if (declaredKeysResult.success) {
      const rest = filterValues(input.value as object, (_, k) => !(k in this.converters));
      const restResult = (Array.isArray(rest)
        ? array(this.otherKeyConverter)
        : record(this.otherKeyConverter)
      ).tryConvertNode(input.setValue(rest));
      if (restResult.success) {
        return success(
          input.setValue(
            Array.isArray(input.value)
              ? [
                  ...declaredKeysResult.value.ifPresent((n) => n.value as any[], []),
                  ...(restResult as SuccessfulResult<Node<any[]>>).value.ifPresent(
                    (n) => n.value,
                    []
                  )
                ]
              : ({
                  ...(restResult as SuccessfulResult<Node<Record<string, any>>>).value.ifPresent(
                    (n) => n.value,
                    {}
                  ),
                  ...declaredKeysResult.value.ifPresent((n) => n.value, {})
                } as any)
          )
        );
      }
      return restResult;
    }
    return declaredKeysResult;
  }

  public get partial(): ObjectConverter<Partial<Result>> {
    const strictPartial = super.partial;
    return new ShapeConverter<Partial<Result>>(
      strictPartial.converters,
      optional(this.otherKeyConverter)
    );
  }
}

export function shape<Result extends object>(
  converters: { [K in keyof Result]-?: ConverterFunction<Result[K], unknown> },
  otherKeyConverter: ConverterFunction<unknown, unknown> = unknownConverter
): ObjectConverter<Result> {
  return new ShapeConverter(
    mapValues(converters, (c) => createConverter(c)) as {
      [K in keyof Result]-?: Converter<Result[K], unknown>;
    },
    createConverter(otherKeyConverter)
  );
}
