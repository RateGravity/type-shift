import { none, None, undefined as undefinedConverter } from './basic-types';
import { noneAsNull, noneAsUndefined } from './coercers';
import { Converter, ConverterFunction, createConverter, getConverterName } from './core';

/**
 * Given a converter function make an optional converter function
 * Optional functions allow undefined values to pass-through
 * @param converter - the inner converter function
 */
export function optional<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | undefined, Input> {
  return createConverter((input, path, entity) => {
    try {
      return converter(input, path, entity);
    } catch {
      return undefinedConverter(input, path, entity);
    }
  }, `optional ${getConverterName(converter)}`);
}

/**
 * Given a converter function make an noneable converter that allows `none`
 * types to pass through
 * @param converter - the inner converter function
 */
export function noneable<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | None, Input> {
  return createConverter((input, path, entity) => {
    try {
      return converter(input, path, entity);
    } catch {
      return none(input, path, entity);
    }
  }, `optional ${getConverterName(converter)}`);
}

/**
 * Given a converter function make an noneable converter function that also coerces
 * `none` to `null`
 * @param converter - the inner converter function
 */
export function noneableAsNull<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | null, Input> {
  return createConverter((input, path, entity) => {
    try {
      return converter(input, path, entity);
    } catch {
      return noneAsNull(input, path, entity);
    }
  }, `optional ${getConverterName(converter)}`);
}

/**
 * Given a converter function make an noneable converter function that also coerces
 * `none` to `undefined`
 * @param converter - the inner converter function
 */
export function noneableAsUndefined<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | undefined, Input> {
  return createConverter((input, path, entity) => {
    try {
      return converter(input, path, entity);
    } catch {
      return noneAsUndefined(input, path, entity);
    }
  }, `optional ${getConverterName(converter)}`);
}
