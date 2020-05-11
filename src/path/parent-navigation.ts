import { Node, Navigation, NextNavigation, missingRootNode } from '../nodes';

export const ParentNavigation = new (class extends Navigation {
  public navigateNext(next: NextNavigation, input: Node<unknown>): Node<unknown> {
    if (input.parent !== null) {
      return next(
        input.parent,
        input.parent!.ifPresent((v) => [v.value], []),
        true
      );
    }
    // ascending out of the tree
    return next(missingRootNode(), [], true);
  }

  public path(currentPath: string): string {
    if (currentPath === '') {
      return '^';
    }
    return `${currentPath}.^`;
  }
})();
