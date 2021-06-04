/**
 * A Converter Function
 */
export interface ConverterFunction<Result, Input = unknown> {
  readonly displayName?: string;
  /**
   * @param input - The Input value to convert
   * @param path - The path to the input value from the root entity
   * @param entity - The root entity that is being converted
   */
  (input: Input, path: (string | number)[], entity: unknown): Result;
}

/**
 * A standard Converter function with extended methods
 */
export interface Converter<Result, Input = unknown> extends ConverterFunction<Result, Input> {
  /**
   * The Name of the converter
   */
  readonly displayName: string;
  /**
   * @param input - The Input value to convert
   * @param path - The path to the input value from the root entity, defaults to []
   * @param entity - The root entity, defaults to input
   */
  (input: Input, path?: (string | number)[], entity?: unknown): Result;

  /**
   * pipes the output of this converter to another converter
   * @param nextConverter - the next converter to call
   * @param name - the name of the resulting converter
   */
  pipe<Next>(nextConverter: ConverterFunction<Next, Result>, name?: string): Converter<Next, Input>;

  /**
   * if this conversion would throw an error
   * try the other conversion
   * @param otherConverter - the other conversion to try
   */
  or<Other>(otherConverter: ConverterFunction<Other, Input>): Converter<Result | Other, Input>;

  /**
   * Provide a default value fallback if the value is undefined
   * The given converter is invoked if the input value is undefined
   * otherwise this converter is invoked. The result of the
   * given converter is passed through this converter as well.
   * @param defaultConverter - the converter to select a default value
   * @returns a new converter that when given an undefined input tries
   * to supply a default value to this converter.
   */
  default(
    defaultConverter: ConverterFunction<Input, undefined>
  ): Converter<Result, Input | undefined>;
}

/**
 * Given a converter function get the name of the converter
 * @param converter - the converter function
 */
export function getConverterName(converter: ConverterFunction<any, any>): string {
  return converter.displayName || converter.name || 'anonymous';
}

/**
 * Given a converter function or converter extract the result type.
 */
export type TypeOf<
  C extends Converter<any, any> | ConverterFunction<any, any>
> = C extends Converter<infer R, any> ? R : C extends ConverterFunction<infer FR, any> ? FR : never;

