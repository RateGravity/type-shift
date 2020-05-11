import { Converter, ConverterFunction, createConverter } from '../converter';
import { ConverterError, ConverterErrors } from '../errors';
import { ConverterResult, SuccessfulResult, success, failed } from '../converter-result';
import { Node, PresentNode } from '../nodes';
import { values, flatMap, mapValues } from '../util';

type Converters<T, Input> = { [K in keyof T]: ConverterFunction<T[K], Input> };

class ComposedConverter<C extends (...args: any) => any, Input> extends Converter<
  ReturnType<C>,
  Input
> {
  public readonly name: string;

  private readonly converters: { [K in keyof Parameters<C>]: Converter<Parameters<C>[K], Input> };
  private readonly combiner: C;

  constructor(
    converters: { [K in keyof Parameters<C>]: Converter<Parameters<C>[K], Input> },
    combiner: C
  ) {
    super();
    this.converters = converters;
    this.combiner = combiner;
    this.name =
      combiner.name ||
      `(${values(converters)
        .map((v) => v.name)
        .join(', ')}) => unknown`;
  }

  public tryConvertNode(node: Node<Input>): ConverterResult<Node<ReturnType<C>>> {
    const args = values(this.converters).map((c) => c.tryConvertNode(node));
    if (args.every((r) => r.success && !r.value.isMissingValue)) {
      try {
        return success(
          node.setValue(
            this.combiner(
              ...(args as Array<SuccessfulResult<PresentNode<any>>>).map(({ value }) => value.value)
            )
          )
        );
      } catch (err) {
        if (err instanceof ConverterError) {
          return failed(err);
        } else if (err instanceof ConverterErrors) {
          return failed(...err.errors);
        } else {
          return failed(
            node.ifPresent(
              (n) => new ConverterError(n.path, this.name, n.value),
              (n) => new ConverterError(n.path, this.name)
            )
          );
        }
      }
    }
    return failed(
      ...flatMap(args, (r) => {
        if (r.success) {
          return [new ConverterError(r.value.path, 'unknown')];
        }
        return r.errors;
      })
    );
  }
}

/**
 * Combine an arbitrary number of converters and pass their resulting
 *   values into the `combiner` function.
 *
 * @param converters - Array of converters to pass in.
 * @param combiner - Function to call with the results of all the
 *   converters.
 */
export const compose = <C extends (...args: any) => any, Input>(
  converters: Converters<Parameters<C>, Input>,
  combiner: C
): Converter<ReturnType<C>, Input> => {
  return new ComposedConverter(
    mapValues(converters, (c) => createConverter(c)),
    combiner
  );
};
