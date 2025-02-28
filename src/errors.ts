import { displayValue, formatPath } from './formatting';

/**
 * Converter Errors are the standard errors
 * coming from type-converters
 */
export class ConverterError extends Error {
  /**
   * The issues that occured during the conversion
   */
  public readonly issues: {
    path: (string | number)[];
    actual: unknown;
    expected: string;
  }[];

  /**
   * Error Fields records the path to fields that have an error.
   * The key of the errorFields is a path in the form of $.part[index]
   */
  public get errorFields(): Record<string, { expected: string; actual: unknown }> {
    return Object.fromEntries(
      this.issues.map(({ path, actual, expected }) => [
        formatPath(path),
        { expected, actual: displayValue(actual) }
      ])
    );
  }

  constructor(actual: unknown, expected: string, path: (string | number)[]) {
    super(`At Path ${formatPath(path)}, expected ${expected} but was ${displayValue(actual)}`);
    this.name = 'ConverterError';
    this.issues = [
      {
        path,
        actual,
        expected
      }
    ];
  }
}
