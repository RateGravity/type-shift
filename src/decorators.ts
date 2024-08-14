import { None } from './basic-types';
import { Converter, ConverterFunction, createConverter, getConverterName } from './core';

/**
 * A decorator is a function that takes a converter function and returns
 *   a new converter function. The idea is that this new converter function
 *   will wrap the original converter function and modify its behavior.
 */
export type Decorator<Result, Input = unknown> = (
  converter: ConverterFunction<Result, Input>
) => ConverterFunction<Result, Input>;

/**
 * Given a converter function make an optional converter function
 * Optional functions allow undefined values to pass-through
 * @param converter - the inner converter function
 */
export function optional<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | undefined, Input | undefined> {
  return createConverter((input, path, entity) => {
    if (input === undefined) {
      return undefined;
    }
    return converter(input, path, entity);
  }, `optional ${getConverterName(converter)}`);
}

/**
 * Given a converter function make an noneable converter that allows `none`
 * types to pass through
 * @param converter - the inner converter function
 */
export function noneable<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | None, Input | None> {
  return createConverter((input, path, entity) => {
    if (input === undefined) {
      return undefined;
    }

    if (input === null) {
      return null;
    }

    return converter(input, path, entity);
  }, `optional ${getConverterName(converter)}`);
}

/**
 * Given a converter function make an noneable converter function that also coerces
 * `none` to `null`
 * @param converter - the inner converter function
 */
export function noneableAsNull<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | null, Input | None> {
  return createConverter((input, path, entity) => {
    if (input === undefined || input === null) {
      return null;
    }
    return converter(input, path, entity);
  }, `optional ${getConverterName(converter)}`);
}

/**
 * Given a converter function make an noneable converter function that also coerces
 * `none` to `undefined`
 * @param converter - the inner converter function
 */
export function noneableAsUndefined<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | undefined, Input | None> {
  return createConverter((input, path, entity) => {
    if (input === undefined || input === null) {
      return undefined;
    }
    return converter(input, path, entity);
  }, `optional ${getConverterName(converter)}`);
}
