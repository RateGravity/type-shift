import { Node, Navigation, NextNavigation } from './types';

export const RootNavigation = new (class extends Navigation {
  public navigateNext(next: NextNavigation, input: Node<unknown>): Node<unknown> {
    let root = input;
    // walk to the root
    while (root.parent !== null) {
      root = root.parent;
    }
    return next(
      root,
      root.ifPresent((v) => [v.value], []),
      true
    );
  }

  public path(): string {
    return '$';
  }
})();
