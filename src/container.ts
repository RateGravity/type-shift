import { Converter, ConverterFunction, getConverterName } from './core';
import { createConverter } from './create-converter';
import { ConverterError } from './errors';

/**
 * A Record\<string,T\> converter
 * @param converter - the converter to use for the values in the record
 */
export function record<T>(
  converter: ConverterFunction<T, unknown>
): Converter<Record<string, T>, unknown> {
  const name = `Record<string,${getConverterName(converter)}>`;
  return createConverter((value, path, entity) => {
    if (
      value === null ||
      value === undefined ||
      typeof value !== 'object' ||
      Array.isArray(value)
    ) {
      throw new ConverterError(value, name, path);
    }
    const val = value as Record<string, unknown>;
    const errors: ConverterError[] = [];
    const result = Object.keys(val)
      .map((key) => {
        const v = val[key];
        const newPath = [...path, key];
        try {
          return {
            [key]: converter(v, newPath, entity)
          };
        } catch (err) {
          if (err instanceof ConverterError) {
            errors.push(err);
          } else {
            errors.push(new ConverterError(v, getConverterName(converter), newPath));
          }
          return {};
        }
      })
      .reduce((acc, obj) => ({ ...acc, ...obj }), {}) as Record<string, T>;
    if (errors.length > 0) {
      throw errors.reduce((l, r) => {
        Object.assign(l.errorFields, r.errorFields);
        return l;
      });
    }
    return result;
  }, name);
}

/**
 * A Array\<T\> converter
 * @param converter - the converter to use for values of the array.
 */
export function array<T>(converter: ConverterFunction<T, unknown>): Converter<T[], unknown> {
  const name = `Array<${getConverterName(converter)}>`;
  return createConverter((value, path, entity) => {
    if (!Array.isArray(value)) {
      throw new ConverterError(value, name, path);
    }
    const errors: ConverterError[] = [];
    const result = value.map((v, i) => {
      const newPath = [...path, i];
      try {
        return converter(v, newPath, entity);
      } catch (err) {
        if (err instanceof ConverterError) {
          errors.push(err);
        } else {
          errors.push(new ConverterError(v, getConverterName(converter), newPath));
        }
      }
      return undefined;
    });
    if (errors.length > 0) {
      throw errors.reduce((l, r) => {
        Object.assign(l.errorFields, r.errorFields);
        return l;
      });
    }
    return result as T[];
  }, name);
}
