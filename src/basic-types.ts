import { Converter, createConverter } from './core';
import { ConverterError } from './errors';
import { displayValue } from './formatting';

/**
 * Converts values to numbers
 * This expects incoming values to be numbers or string then
 * calls the Number constructor to try to convert values
 */
const NumberConverter = createConverter((value: unknown, path) => {
  if (typeof value === 'number' || typeof value === 'string') {
    const n = Number(value);
    if (!isNaN(n)) {
      return n;
    }
  }
  throw new ConverterError(value, 'number', path);
}, 'number');

/**
 * Converts defined non-object and non-functions to strings.
 * This calls the String constructor to convert incoming values
 */
const StringConverter = createConverter((value: unknown, path) => {
  if (
    value === undefined ||
    value === null ||
    typeof value === 'object' ||
    typeof value === 'function'
  ) {
    throw new ConverterError(value, 'string', path);
  }
  return String(value);
}, 'string');

/**
 * Converts values to booleans
 * this accepts the string literals of "true" or "false" but otherwise expects a boolean or Boolean
 */
const BooleanConverter = createConverter((value: unknown, path) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value instanceof Boolean) {
    return value.valueOf();
  }
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  }
  throw new ConverterError(value, 'boolean', path);
}, 'boolean');

/**
 * Passes through an unknown value unchanged.
 * Useful when used with the record container
 */
const UnknownConverter = createConverter((value: unknown) => value, 'unknown');

/**
 * Always throws an error no mater what value is passed
 * Useful when dealing with deprecated properties that should not be provided
 */
const NeverConverter = createConverter((value: unknown, path) => {
  throw new ConverterError(value, 'never', path);
}, 'never');

/**
 * Given a value create a converter that must match the literal value
 * @param value the literal value to compare to, uses === identity equality
 */
export function literal<V extends string | number | boolean | null | undefined>(
  value: V
): Converter<V, unknown> {
  const name = displayValue(value);
  return createConverter((input, path) => {
    if (input === value) {
      return value;
    }
    throw new ConverterError(input, name, path);
  }, name);
}

/**
 * Converter that matches the literal null,
 * You can make values optionally nullable by using
 * t.null.or(...)
 */
const NullConverter = literal<null>(null);

/**
 * Converter that matches the literal undefined,
 * You can make values optionally undefined by using
 * t.undefined.or(...)
 */
const UndefinedConverter = literal<undefined>(undefined);

export {
  NumberConverter as number,
  StringConverter as string,
  BooleanConverter as boolean,
  UnknownConverter as unknown,
  NeverConverter as never,
  NullConverter as null,
  UndefinedConverter as undefined
};
