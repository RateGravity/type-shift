import { Node, Navigation, NextNavigation } from '../nodes';

export const CurrentNavigation = new (class extends Navigation {
  public navigateNext(next: NextNavigation, input: Node<unknown>): Node<unknown> {
    return next(
      input,
      input.ifPresent((v) => [v.value], []),
      true
    );
  }

  public path(currentPath: string): string {
    if (currentPath === '') {
      return '@';
    }
    return currentPath;
  }
})();
