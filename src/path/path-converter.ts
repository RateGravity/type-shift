import { LiteralValues, parse } from './parser';
import { ConverterResult } from '../converter-result';
import { OptionalConverter } from '../optional';
import { Node } from '../nodes';
import { Tree } from './tree';

class PathConverter extends OptionalConverter<unknown, unknown> {
  public readonly name: string;

  private readonly tree: Tree;

  constructor(tree: Tree) {
    super();
    this.tree = tree;
    this.name = `path ${tree.path('')}`;
  }

  public tryConvertNode(input: Node<unknown>): ConverterResult<Node<unknown>> {
    return {
      success: true,
      value: this.tree.navigate(input)
    };
  }
}

export function path(
  data: TemplateStringsArray,
  ...exprs: LiteralValues[]
): OptionalConverter<unknown, unknown> {
  return new PathConverter(new Tree(parse(data, exprs)));
}
