import { Node, Navigation, NextNavigation } from './types';
import { flatMap, values as allValues } from '../util';

export const DotStarNavigation = new (class extends Navigation {
  public navigateNext(
    next: NextNavigation,
    input: Node<unknown>,
    values: unknown[]
  ): Node<unknown> {
    const v = flatMap(values, (value) => {
      // all children
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        return allValues(value!);
      }
      return [];
    });
    return next(input.child(this, v), v, false);
  }

  public path(currentPath: string): string {
    return `${currentPath}.*`;
  }
})();
