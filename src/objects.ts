import { None } from './basic-types';
import { Converter, ConverterFunction, createConverter, getConverterName } from './core';
import { Decorator, noneable, noneableAsNull, noneableAsUndefined, optional } from './decorators';
import { ConverterError } from './errors';

/**
 * The ShapeConverter is a converter, however we expose the
 * converters that were used to create it. This allows for these
 * converters to be spread, in order to inherit them.
 */
export interface ShapeConverter<Result extends object> extends Converter<Result, unknown> {
  readonly strict: boolean;
  readonly converters: {
    [K in keyof Required<Result>]: Converter<Result[K], unknown>;
  };
}

/**
 * A strict converter where properties not explicitly specified will not be returned
 * @param converters - an object structure describing the resulting value
 */
export function strict<S extends object>(
  converters: { [K in keyof Required<S>]: ConverterFunction<S[K], unknown> }
): ShapeConverter<S> {
  const name = `{${(Object.keys(converters) as (keyof S)[])
    .map((key) => `${String(key)}: ${getConverterName(converters[key])}`)
    .join(', ')}}`;
  return Object.defineProperties(
    createConverter((value, path, entity) => {
      const v = value === null ? {} : value;
      if (v === undefined || typeof v !== 'object') {
        throw new ConverterError(value, name, path);
      }
      const errors: ConverterError[] = [];
      const result = (Object.keys(converters) as (keyof S)[])
        .map((key) => {
          const val = (v as any)[key];
          const newPath = [...path, key as string | number];
          const converter = converters[key];
          try {
            return {
              [key]: converter(val, newPath, entity)
            };
          } catch (err) {
            if (err instanceof ConverterError) {
              errors.push(err);
            } else {
              errors.push(new ConverterError(val, getConverterName(converter), newPath));
            }
            return {};
          }
        })
        .reduce((acc, obj) => ({ ...acc, ...obj }), {}) as S;
      if (errors.length > 0) {
        throw errors.reduce((l, r) => {
          l.issues.push(...r.issues);
          return l;
        });
      }
      return result;
    }, name),
    {
      converters: {
        enumerable: true,
        value: (Object.keys(converters) as (keyof S)[]).reduce(
          (l, key) => ({
            ...l,
            [key]: createConverter(converters[key])
          }),
          {}
        ),
        writable: false
      },
      strict: {
        enumerable: true,
        value: true,
        writable: false
      }
    }
  ) as ShapeConverter<S>;
}

/**
 * A loose shape converter that allows unknown properties to pass through
 * Generally shape should be used if the value is going to be "re-serialized" as-is
 * This is useful for things like application stacks which may want to verify a subset of
 * properties but leave most validation up to the domain stack
 * @param converters - an object structure describing the resulting value
 */
export function shape<S extends object>(
  converters: { [K in keyof Required<S>]: ConverterFunction<S[K], unknown> }
): ShapeConverter<S> {
  const converter = strict(converters);
  return Object.defineProperties(
    createConverter((value, path, entity) => {
      const result = converter(value, path, entity);
      // Find all the missing keys
      const val = value as object;
      return Object.keys(val)
        .filter((key) => !(key in converters))
        .reduce(
          (l, key) => ({
            ...l,
            [key]: (val as any)[key]
          }),
          result
        );
    }, converter.displayName),
    {
      converters: {
        value: converter.converters,
        writable: false,
        enumerable: true
      },
      strict: {
        value: false,
        writable: false,
        enumerable: true
      }
    }
  ) as ShapeConverter<S>;
}

/**
 * Given a shape and converter, wraps all members of the shape in that
 *   converter.
 *
 * If the given shape converter was created with the t.strict creator
 *   the resulting partial will also be strict
 * @param converter - the shape converter to make partial
 */
export function decorate<Result, Input = unknown>(decorator: Decorator<Result, Input>) {
  return <S extends object>(converter: ShapeConverter<S>): ShapeConverter<S> => {
    if (converter.strict) {
      return strict(
        Object.keys(converter.converters).reduce(
          (l, key) => ({
            ...l,
            [key]: decorator((converter.converters as any)[key])
          }),
          {} as any
        )
      );
    } else {
      return shape(
        Object.keys(converter.converters).reduce(
          (l, key) => ({
            ...l,
            [key]: decorator((converter.converters as any)[key])
          }),
          {} as any
        )
      );
    }
  };
}

/**
 * Given a shape converter turns all converters into optionals.
 *
 * If the given shape converter was created with the t.strict creator
 * the resulting partial will also be strict
 * @param converter - the shape converter to make partial
 */
export function partial<S extends object>(
  converter: ShapeConverter<S>
): ShapeConverter<{ [K in keyof S]: S[K] | undefined }> {
  return decorate(optional)(converter);
}

/**
 * Given a shape converter turns all converters into noneable.
 *
 * If the given shape converter was created with the t.strict creator
 * the resulting partial will also be strict
 * @param converter - the shape converter to wrap all fields in noneable
 */
export function noneableChildren<S extends object>(
  converter: ShapeConverter<S>
): ShapeConverter<{ [K in keyof S]: S[K] | None }> {
  return decorate(noneable)(converter);
}

/**
 * Given a shape converter turns all converters into noneableAsUndefined.
 *
 * If the given shape converter was created with the t.strict creator
 * the resulting partial will also be strict
 * @param converter - the shape converter to wrap all fields in noneableAsUndefined
 */
export function noneableChildrenAsUndefined<S extends object>(
  converter: ShapeConverter<S>
): ShapeConverter<{ [K in keyof S]: S[K] | undefined }> {
  return decorate(noneableAsUndefined)(converter);
}

/**
 * Given a shape converter turns all converters into noneableAsNull.
 *
 * If the given shape converter was created with the t.strict creator
 * the resulting partial will also be strict
 * @param converter - the shape converter to wrap all fields in noneableAsNull
 */
export function noneableChildrenAsNull<S extends object>(
  converter: ShapeConverter<S>
): ShapeConverter<{ [K in keyof S]: S[K] | null }> {
  return decorate(noneableAsNull)(converter);
}
