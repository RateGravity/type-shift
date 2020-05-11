import { formatValue } from '../format-value';
import { Node, Navigation, NextNavigation } from './types';
import { flatMap } from '../util';

export class BracketedNavigation extends Navigation {
  private readonly parts: Array<string | number>;

  constructor(parts: Array<string | number>) {
    super();
    this.parts = parts;
  }

  public navigateNext(
    next: NextNavigation,
    input: Node<unknown>,
    values: unknown[],
    isExact: boolean
  ): Node<unknown> {
    isExact = isExact && this.parts.length < 2;
    const v = flatMap(values, (value) => {
      if (value !== null && typeof value === 'object') {
        return this.parts
          .filter((part) => {
            return (
              (typeof part === 'number' &&
                part < 0 &&
                Array.isArray(value) &&
                value.length + part > 0) ||
              part in (value as object)
            );
          })
          .map((part: string | number) => {
            if (typeof part === 'number' && part < 0 && Array.isArray(value)) {
              return value[value.length + part];
            } else {
              return (value as any)[part];
            }
          });
      }
      return [];
    });
    return next(
      isExact
        ? v.length === 1
          ? input.child(this, v[0])
          : input.missingChild(this)
        : input.child(this, v),
      v,
      isExact
    );
  }

  public path(currentPath: string): string {
    return `${currentPath}[${this.parts.map(formatValue).join(',')}]`;
  }
}
