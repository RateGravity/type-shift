import { Node, Navigation, NextNavigation } from './types';
import { flatMap, filterValues, values as allValues } from '../util';

export class PredicateNavigation extends Navigation {
  private readonly predicate: (value: unknown, key: number | string, entity: object) => boolean;

  constructor(predicate: (value: unknown, key: number | string, entity: object) => boolean) {
    super();
    this.predicate = predicate;
  }

  public navigateNext(
    next: NextNavigation,
    input: Node<unknown>,
    values: unknown[]
  ): Node<unknown> {
    const v = flatMap(values, (v) => {
      if (v !== null && typeof v === 'object') {
        return allValues(filterValues(v!, this.predicate)) as unknown[];
      }
      return [];
    });
    return next(input.child(this, v), v, false);
  }

  public path(currentPath: string): string {
    return `${currentPath}[\${${this.predicate.name || '() => boolean'}}]`;
  }
}
