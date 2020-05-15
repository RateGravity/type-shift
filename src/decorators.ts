import { undefined as undefinedConverter } from './basic-types';
import { Converter, ConverterFunction } from './core';

/**
 * Given a converter function make an optional converter function
 * Optional functions allow undefined values to pass-through
 * @param converter - the inner converter function
 */
export function optional<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result | undefined, Input | undefined> {
  return (undefinedConverter as Converter<undefined, Input | undefined>).or(
    converter as Converter<Result, Input | undefined>
  );
}
