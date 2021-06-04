import { Converter, ConverterFunction } from './core';
import { createConverter } from './create-converter';

/**
 * Given a converter function make an optional converter function
 * Optional functions allow undefined values to pass-through
 * @param converter - the inner converter function
 */
export function optional<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | undefined, Input | undefined> {
  return createConverter(converter).optional;
}
