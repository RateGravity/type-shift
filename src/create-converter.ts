import { ConverterFunction, Converter, getConverterName } from './core';
import { ConverterError } from './errors';

// count the number of dots or open brackets
// this avoids complex path parsing while getting a "good enough" hueristic
function guessPathLength(formattedPath: string): number {
  return Array.from(formattedPath)
    .map((v) => (v === '.' || v === '[' ? 1 : 0))
    .reduce((l: number, r: number): number => l + r, 0);
}

// find the count of errors at the max depth.
function maxDepthCount(error: ConverterError): { depth: number; count: number } {
  return Object.keys(error.errorFields)
    .map(guessPathLength)
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

function isConverter<Result, Input>(
  converterFunction: ConverterFunction<Result, Input>
): converterFunction is Converter<Result, Input> {
  return (
    'displayName' in converterFunction &&
    'pipe' in converterFunction &&
    'or' in converterFunction &&
    'default' in converterFunction
  );
}

/**
 * Given a converter function and optional name create a converter
 * @param converter - the converter function to use to convert the values
 * @param name - the name, if not specified uses the display name or name property of the converter
 */
export function createConverter<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>,
  name?: string
): Converter<Result, Input> {
  if (isConverter(converter) && name === undefined) {
    return converter;
  }
  name = name === undefined ? getConverterName(converter) : name;
  let optionalCache: Converter<Result | undefined, Input | undefined> | null = null;
  const createdConverter: Converter<Result, Input> = Object.defineProperties(
    (input: Input, path: (string | number)[] = [], entity: unknown = input) =>
      converter(input, path, entity),
    {
      displayName: {
        value: name,
        writable: false,
        enumerable: true
      },
      optional: {
        get(): Converter<Result | undefined, Input | undefined> {
          if (optionalCache === null) {
            optionalCache = createConverter((input, path, entity) => {
              if (input === undefined) {
                return undefined;
              }
              return createdConverter(input, path, entity);
            }, `optional ${createdConverter.displayName}`);
          }
          return optionalCache!
        },
        enumerable: true
      },
      pipe: {
        value<Next>(
          nextConverter: ConverterFunction<Next, Result>,
          displayName?: string
        ): Converter<Next, Input> {
          const createdNextConverter = createConverter(nextConverter);
          displayName =
            displayName === undefined
              ? `${createdConverter.displayName} -> ${createdNextConverter.displayName}`
              : displayName;
          return createConverter(
            (input, path, entity) =>
              createdNextConverter(createdConverter(input, path, entity), path, entity),
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
          const createdOtherConverter = createConverter(otherConverter);
          const joinedName = `${createdConverter.displayName} | ${createdOtherConverter.displayName}`;
          return createConverter((input, path, entity) => {
            try {
              return createdConverter(input, path, entity);
            } catch (err) {
              try {
                return createdOtherConverter(input, path, entity);
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
          const createdDefaultConverter = createConverter(defaultConverter);
          const defaultedName = `${createdConverter.displayName} with default`;
          return createConverter((input: Input | undefined, path, entity) => {
            if (input === undefined) {
              input = createdDefaultConverter(undefined, path, entity);
            }
            return createdConverter(input as Input, path, entity);
          }, defaultedName);
        },
        writable: false,
        enumerable: true
      }
    }
  );
  return createdConverter;
}
