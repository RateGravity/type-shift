import { formatValue } from '../format-value';

export class ConverterError extends Error {
  readonly path: string;
  readonly expected: string;
  readonly actual?: unknown;

  constructor(path: string, expected: string, ...actual: [unknown?]) {
    super(
      `At ${path} expected ${expected} but was ${
        actual.length > 0 ? formatValue(actual[0]) : 'MISSING_VALUE'
      }`
    );
    this.path = path;
    this.expected = expected;
    if (actual.length > 0) {
      this.actual = actual[0];
    } else {
      delete (this as any).actual;
    }
  }
}
