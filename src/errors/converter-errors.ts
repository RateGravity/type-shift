import { ConverterError } from './converter-error';

export class ConverterErrors extends Error {
  public readonly errors: ConverterError[];

  constructor(errors: ConverterError[]) {
    super(errors.map((err) => err.message).join(', '));
    this.errors = errors;
  }
}
