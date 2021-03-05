import { ConverterFunction } from './core';

/**
 * When composing functions it is useful to expose a function that doesn't take additional arguments
 * @param converter - a converter to run on the input
 * @returns a function that passes its first argument only to the converter.
 */
export const convert = <Result, Input>(converter: ConverterFunction<Result, Input>) => (
  input: Input
): Result => converter(input, [], input);
