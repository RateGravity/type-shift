import { displayValue, formatPath } from './formatting';

/**
 * Converter Errors are the standard errors
 * coming from type-converters
 */
export class ConverterError extends Error {
  /**
   * Error Fields records the path to fields that have an error.
   * The key of the errorFields is a path in the form of $.part[index]
   */
  public readonly errorFields: Record<string, { expected: string; actual: unknown }>;

  constructor(actual: unknown, expected: string, path: (string | number)[]) {
    super(`At Path ${formatPath(path)}, expected ${expected} but was ${displayValue(actual)}`);
    this.errorFields = {
      [formatPath(path)]: {
        expected,
        actual: displayValue(actual)
      }
    };
  }
}
