import { ConverterError, ConverterErrors } from './errors';

export interface SuccessfulResult<Result> {
  success: true;
  value: Result;
}

export interface FailedResult {
  success: false;
  errors: ConverterError[];
}

export type ConverterResult<Result> = SuccessfulResult<Result> | FailedResult;

export function isSuccessful<T>(result: ConverterResult<T>): result is ConverterResult<T> {
  return result.success;
}

export function success<T>(value: T): SuccessfulResult<T> {
  return { success: true, value };
}

export function failed(...errors: ConverterError[]): FailedResult {
  return { success: false, errors };
}

export function valueOrThrow<Result>(result: ConverterResult<Result>): Result {
  if (result.success) {
    return result.value;
  }
  if (result.errors.length === 1) {
    throw result.errors[0];
  }
  throw new ConverterErrors(result.errors);
}
