import { Node, Navigation, NextNavigation } from '../nodes';

export class Tree extends Navigation {
  private readonly tree: Navigation[];

  constructor(tree: Navigation[]) {
    super();
    this.tree = tree;
  }

  public navigateNext(
    next: NextNavigation,
    input: Node<unknown>,
    values: unknown[],
    exact: boolean
  ): Node<unknown> {
    return this.tree.reduceRight(
      (n: NextNavigation, navigation: Navigation) => navigation.navigateNext.bind(navigation, n),
      next
    )(input, values, exact);
  }

  public path(currentPath: string): string {
    for (const part of this.tree) {
      currentPath = part.path(currentPath);
    }
    return currentPath;
  }
}
