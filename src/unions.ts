import { Converter, ConverterFunction, createConverter, getConverterName } from './core';
import { ConverterError } from './errors';
import { displayValue } from './formatting';

/**
 * One of a set of constant types
 * This uses triple equality (===) to compare
 */
export function oneOf<V extends string | number | boolean | undefined | null>(
  options: V[] | readonly V[]
): Converter<V, unknown> {
  const name = options.map((v) => displayValue(v)).join(' | ');
  return createConverter((value, path) => {
    if (options.includes(value as V)) {
      return value as V;
    }
    throw new ConverterError(value, name, path);
  }, name);
}

/**
 * A union type for tagged unions
 * @param tag - the branch selector selects which union branch to use
 * @param options - the union branches
 */
export function taggedUnion<R extends object, Input = unknown>(
  tag: keyof R,
  options: Record<string, ConverterFunction<R, Input>>
): Converter<R, Input> {
  const name = `${Object.keys(options)
    .map((key) => getConverterName(options[key]))
    .join(' | ')}`;
  return createConverter((value, path, entity) => {
    if (value === null || value === undefined || !(tag in value)) {
      throw new ConverterError(value, name, path);
    }
    const v = `${(value as any)[tag]}`;
    if (!(v in options)) {
      throw new ConverterError(value, name, path);
    }
    return options[v](value, path, entity);
  }, name);
}

/**
 * Flattens a converter function that returns a converter function into
 *   just a converter function.
 *
 * @param converter - Converter function to flatten.
 */
export const select = <TOutput, TInput = unknown>(
  converter: ConverterFunction<ConverterFunction<TOutput, TInput>, TInput>
): Converter<TOutput, TInput> =>
  createConverter((input: TInput, path: (string | number)[] = [], entity: unknown = input) => {
    const pick = converter(input, path, entity);
    return pick(input, path, entity);
  });
