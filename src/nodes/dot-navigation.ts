import { Node, Navigation, NextNavigation } from './types';

export class DotNavigation extends Navigation {
  private readonly name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public navigateNext(
    next: NextNavigation,
    input: Node<unknown>,
    values: unknown[],
    isExact: boolean
  ): Node<unknown> {
    isExact = isExact && true;
    const v = values
      .filter(
        (value) => value !== null && typeof value === 'object' && this.name in (value as object)
      )
      .map((value) => (value as any)[this.name]);
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
    return `${currentPath}.${this.name}`;
  }
}
