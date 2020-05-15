import { Converter, ConverterFunction, createConverter, getConverterName } from './core';

export type ComposedConverters<T> = { [K in keyof T]: ConverterFunction<T[K]> };

/**
 * Combine an arbitrary number of converters and pass their resulting
 *   values into the `combiner` function.
 *
 * @param converters - Array of converters to pass in.
 * @param combiner - Function to call with the results of all the
 *   converter functions.
 */
export const compose = <C extends (...args: any) => any>(
  converters: ComposedConverters<Parameters<C>>,
  combiner: C
): Converter<ReturnType<C>> => {
  return createConverter((value, path, entity) => {
    const args = Object.values(converters).map((c) => c(value, path, entity));
    return combiner(...args);
  }, getConverterName(combiner));
};
