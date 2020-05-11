import { ConverterError, ConverterErrors } from './errors';
import { Node, rootNode } from './nodes';
import { formatValue } from './format-value';
import { ConverterResult, valueOrThrow, failed, success } from './converter-result';

export type ConverterFunction<Result, Input> =
  | ((input: Input) => Result)
  | Converter<Result, Input>;

export type DefaultConverterFunction<Input> = (() => Input) | Converter<never, Input> | Input;

export abstract class Converter<Result, Input> {
  public abstract readonly name: string;

  public convert(input: Input): Result {
    return valueOrThrow(this.tryConvert(input));
  }

  public tryConvert(input: Input): ConverterResult<Result> {
    const result = this.tryConvertNode(rootNode(input));
    if (result.success) {
      return result.value.ifPresent(
        (n) => success(n.value),
        (n) => failed(new ConverterError(n.path, this.name))
      );
    } else {
      return result;
    }
  }

  public abstract tryConvertNode(input: Node<Input>): ConverterResult<Node<Result>>;

  public pipe<Next>(
    converter: ConverterFunction<Next, Result>,
    name?: string
  ): Converter<Next, Input> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const s = this;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const c = createConverter(converter);
    return new (class extends Converter<Next, Input> {
      public readonly name = name !== undefined ? name : `${s.name} -> ${c.name}`;
      public tryConvertNode(input: Node<Input>): ConverterResult<Node<Next>> {
        const result = s.tryConvertNode(input);
        if (result.success) {
          return c.tryConvertNode(result.value);
        } else {
          return result;
        }
      }
    })();
  }

  public default(missingConverter: DefaultConverterFunction<Input>): Converter<Result, Input> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const s = this;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const d = createDefaultConverter(missingConverter);
    const ifNotPresent = d.pipe(s);
    return new (class extends Converter<Result, Input> {
      public readonly name = `${s.name} default ${d.name}`;
      public tryConvertNode(input: Node<Input>): ConverterResult<Node<Result>> {
        return input.ifPresent(
          (n) => s.tryConvertNode(n),
          (n) => ifNotPresent.tryConvertNode(n)
        );
      }
    })();
  }
}

export function createConverter<Result, Input>(
  converter: ConverterFunction<Result, Input>,
  name?: string
): Converter<Result, Input> {
  if (typeof converter === 'function') {
    return new (class extends Converter<Result, Input> {
      public readonly name = name !== undefined ? name : converter.name || 'anonymous';
      public tryConvertNode(input: Node<Input>): ConverterResult<Node<Result>> {
        return input.ifPresent(
          (n) => {
            try {
              const value = converter(n.value);
              return success(n.setValue(value));
            } catch (err) {
              if (err instanceof ConverterError) {
                return failed(err);
              }
              if (err instanceof ConverterErrors) {
                return failed(...err.errors);
              }
              if (typeof err === 'object' && err !== null && 'actual' in err && 'expected' in err) {
                return failed(
                  new ConverterError(
                    n.path,
                    formatValue((err as any).expected),
                    (err as any).actual
                  )
                );
              }
              return failed(new ConverterError(n.path, this.name, n.value));
            }
          },
          (n) => failed(new ConverterError(n.path, this.name))
        );
      }
    })();
  } else {
    return converter;
  }
}

export function createDefaultConverter<Result>(
  converter: DefaultConverterFunction<Result>,
  name?: string
): Converter<Result, never> {
  if (converter instanceof Converter) {
    return converter;
  } else if (typeof converter === 'function') {
    const c = converter as () => Result;
    return new (class extends Converter<Result, never> {
      public readonly name = name !== undefined ? name : c.name || 'anonymous';
      public tryConvertNode(input: Node<never>): ConverterResult<Node<Result>> {
        return input.ifPresent(
          (n) => failed(new ConverterError(n.path, 'never', n.value)),
          (n) => {
            try {
              return success(n.setValue(c()));
            } catch (err) {
              if (err instanceof ConverterError) {
                return failed(err);
              }
              if (err instanceof ConverterErrors) {
                return failed(...err.errors);
              }
              if (typeof err === 'object' && err !== null && 'actual' in err && 'expected' in err) {
                return failed(
                  new ConverterError(
                    n.path,
                    formatValue((err as any).expected),
                    (err as any).actual
                  )
                );
              }
              return failed(new ConverterError(n.path, this.name));
            }
          }
        );
      }
    })();
  } else {
    return new (class extends Converter<Result, never> {
      public readonly name = name !== undefined ? name : formatValue(converter);
      public tryConvertNode(input: Node<never>): ConverterResult<Node<Result>> {
        return input.ifPresent(
          (n) => failed(new ConverterError(n.path, 'never', n.value)),
          (n) => success(n.setValue(converter))
        );
      }
    })();
  }
}
