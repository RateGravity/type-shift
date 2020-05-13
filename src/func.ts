import { ConverterFunction } from './core';

/**
 * When composing functions it is useful to expose a function that doesn't take additional arguments
 * This can be used for instance in the pipe function.
 * @param converter
 */
export const convert = <Result, Input>(converter: ConverterFunction<Result, Input>) => (
  input: Input
) => converter(input, [], input);
