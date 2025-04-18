import { StandardSchemaV1 } from './standard-schema';
import { ConverterError } from './errors';
import { displayValue } from './formatting';

// find the count of errors at the max depth.
function maxDepthCount(error: ConverterError): { depth: number; count: number } {
  return error.issues
    .map(({ path }) => path.length)
    .reduce(
      (max: { depth: number; count: number }, d) => {
        if (d === max.depth) {
          max.count += 1;
        } else if (d > max.depth) {
          max.depth = d;
          max.count = 1;
        }
        return max;
      },
      { depth: 0, count: 0 }
    );
}

/**
 * Convert a converter function into a StandardSchema validator function
 * @param converter - the converter function to convert
 * @returns a validator function
 */
function asValidator<Input, Result>(
  converter: ConverterFunction<Result, Input>
): StandardSchemaV1.Props<Input, Result>['validate'] {
  return (input: unknown) => {
    try {
      return {
        // standard schema specifies an input type but then the function uses unknown
        value: converter(input as Input, [], input)
      };
    } catch (error) {
      if (error instanceof ConverterError) {
        // convert ConverterError into the StandardSchemaV1.FailureResult
        return {
          issues: error.issues.map(({ path, expected, actual }) => ({
            message: `expected ${expected} but was ${displayValue(actual)}`,
            path: path
          }))
        };
      }
      // convert other errors into the FailureResult
      return {
        issues: [
          {
            message:
              error !== null && typeof error === 'object' && 'message' in error
                ? `${error.message}`
                : `${error}`
          }
        ]
      };
    }
  };
}

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
export interface Converter<Result, Input = unknown>
  extends ConverterFunction<Result, Input>,
    StandardSchemaV1<Input, Result> {
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

/**
 * Given a converter function and optional name create a converter
 * @param converter - the converter function to use to convert the values
 * @param name - the name, if not specified uses the display name or name property of the converter
 */
export function createConverter<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>,
  name: string = getConverterName(converter)
): Converter<Result, Input> {
  return Object.defineProperties(
    (input: Input, path: (string | number)[] = [], entity: unknown = input) =>
      converter(input, path, entity),
    {
      displayName: {
        value: name,
        writable: false,
        enumerable: true
      },
      pipe: {
        value<Next>(
          nextConverter: ConverterFunction<Next, Result>,
          displayName: string = `${name} -> ${getConverterName(nextConverter)}`
        ): Converter<Next, Input> {
          return createConverter(
            (input, path, entity) => nextConverter(converter(input, path, entity), path, entity),
            displayName
          );
        },
        writable: false,
        enumerable: true
      },
      or: {
        value<Other>(
          otherConverter: ConverterFunction<Other, Input>
        ): Converter<Result | Other, Input> {
          const joinedName = `${name} | ${getConverterName(otherConverter)}`;
          return createConverter((input, path, entity) => {
            try {
              return converter(input, path, entity);
            } catch (err) {
              try {
                return otherConverter(input, path, entity);
              } catch (other) {
                if (err instanceof ConverterError && other instanceof ConverterError) {
                  // heuristic to figure out which is the more likely branch
                  const errStat = maxDepthCount(err);
                  const otherStat = maxDepthCount(other);
                  // if one is able to find errors deeper in the tree it's more likely
                  if (errStat.depth > otherStat.depth) {
                    throw err;
                  } else if (otherStat.depth > errStat.depth) {
                    throw other;
                    // the one with the most deepest errors is more likely
                  } else if (errStat.count > otherStat.count) {
                    throw err;
                  } else if (otherStat.count > errStat.count) {
                    throw err;
                  }
                  // if both have the same number of errors at the same level create a joined up error:
                  // example t.string.or(t.boolean) should be "expected string | boolean but was ..."
                }
                // throw a joined up error
                throw new ConverterError(input, joinedName, path);
              }
            }
          }, joinedName);
        },
        writable: false,
        enumerable: true
      },
      default: {
        value(
          defaultConverter: ConverterFunction<Input, undefined>
        ): Converter<Result, Input | undefined> {
          const defaultedName = `${name} with default`;
          return createConverter((input: Input | undefined, path, entity) => {
            if (input === undefined) {
              input = defaultConverter(undefined, path, entity);
            }
            return converter(input as Input, path, entity);
          }, defaultedName);
        },
        writable: false,
        enumerable: true
      },
      '~standard': {
        value: {
          version: 1,
          vendor: 'type-shift',
          validate: asValidator(converter)
        },
        writable: false,
        enumerable: true
      }
    }
  );
}
