import { displayValue } from './formatting';
import { Converter } from './core';
import { None, none } from './basic-types';

/**
 * Given a set of converters if one succeeds at converting the input return the
 * given value.
 *
 * @param converters - Array of converters to pass in.
 * @param value - Value to return
 *
 */
export const coerce = <V>(
  converters: [Converter<any>, ...Converter<any>[]],
  value: V
): Converter<V> => {
  const predicate = converters.reduce((c1, c2) => c1.or(c2));
  return predicate.pipe(() => value, `${predicate.displayName} -> ${displayValue(value)}`);
};

/**
 * A coercer that coerces values of None type to a null literal
 */
export const noneAsNull: Converter<None> = coerce([none], null);

/**
 * A coercer that coerces values of None type to an undefined literal
 */
export const noneAsUndefined: Converter<None> = coerce([none], undefined);
