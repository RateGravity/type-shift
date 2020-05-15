import { Converter, ConverterFunction, createConverter, getConverterName } from './core';
import { optional } from './decorators';
import { ConverterError } from './errors';

/**
 * The ShapeConverter is a converter, however we expose the
 * converters that were used to create it. This allows for these
 * converters to be spread, in order to inherit them.
 */
export interface ShapeConverter<S extends object> extends Converter<S, unknown> {
  readonly strict: boolean;
  readonly converters: { [K in keyof S]: Converter<S[K], unknown> };
}

/**
 * A strict converter where properties not explicitly specified will not be returned
 * @param converters - an object structure describing the resulting value
 */
export function strict<S extends object>(
  converters: { [K in keyof S]: ConverterFunction<S[K], unknown> }
): ShapeConverter<S> {
  const name = `{${(Object.keys(converters) as (keyof S)[])
    .map((key) => `${key}: ${getConverterName(converters[key])}`)
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
          Object.assign(l.errorFields, r.errorFields);
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
  );
}

/**
 * A loose shape converter that allows unknown properties to pass through
 * Generally shape should be used if the value is going to be "re-serialized" as-is
 * This is useful for things like application stacks which may want to verify a subset of
 * properties but leave most validation up to the domain stack
 * @param converters - an object structure describing the resulting value
 */
export function shape<S extends object>(
  converters: { [K in keyof S]: ConverterFunction<S[K], unknown> }
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
  );
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
  if (converter.strict) {
    return strict(
      Object.keys(converter.converters).reduce(
        (l, key) => ({
          ...l,
          [key]: optional((converter.converters as any)[key])
        }),
        {} as any
      )
    );
  } else {
    return shape(
      Object.keys(converter.converters).reduce(
        (l, key) => ({
          ...l,
          [key]: optional((converter.converters as any)[key])
        }),
        {} as any
      )
    );
  }
}
