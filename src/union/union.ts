import { Converter, ConverterFunction, createConverter } from '../converter';
import { ConverterResult } from '../converter-result';
import { Node, PresentNode } from '../nodes';
import { oneOf } from '../basic-types';
import { mapValues, values } from '../util';
import { path } from '../path';

class Union<Result, Input, Keys extends string | number = string | number> extends Converter<
  Result,
  Input
> {
  public readonly name: string;
  public readonly options: Record<Keys, Converter<Result, Input>>;
  private readonly keySelector: Converter<Keys, Input>;

  constructor(
    keySelector: Converter<unknown, Input>,
    options: Record<Keys, Converter<Result, Input>>
  ) {
    super();
    this.name = (values(options) as Array<Converter<Result, Input>>).map((v) => v.name).join(' | ');
    this.keySelector = keySelector.pipe(oneOf<Keys>(...(Object.keys(options) as Keys[])));
    this.options = options;
  }

  public tryConvertNode(node: Node<Input>): ConverterResult<Node<Result>> {
    const key = this.keySelector.tryConvertNode(node) as ConverterResult<PresentNode<Keys>>;
    if (!key.success) {
      return key;
    }
    return this.options[key.value.value].tryConvertNode(node);
  }
}

/**
 * A discriminated Union
 * @param tag the branch selector selects which union branch to use
 * @param options the union branches
 */
export function union<Result, Input = unknown, Keys extends string | number = string | number>(
  keySelector: ConverterFunction<Keys, Input> | string,
  options: Record<Keys, ConverterFunction<Result, Input>>
): Converter<Result, Input> {
  return new Union(
    typeof keySelector === 'string' ? path`@[${keySelector}]` : createConverter(keySelector),
    mapValues(options, (c) => createConverter(c))
  );
}
