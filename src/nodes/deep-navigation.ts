import { Node, Navigation, NextNavigation } from './types';

export class DeepNavigation extends Navigation {
  private readonly name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public navigateNext(
    next: NextNavigation,
    input: Node<unknown>,
    values: unknown[]
  ): Node<unknown> {
    // deep property search
    const v: unknown[] = [];
    const candidates = [...values];
    while (candidates.length > 0) {
      const candidate = candidates.shift()!;
      if (candidate !== null && typeof candidate === 'object') {
        if (Array.isArray(candidate)) {
          candidates.push(...candidate);
        } else {
          Object.keys(candidate as object).forEach((key) => {
            candidates.push((candidate as any)[key]);
            if (key === this.name) {
              v.push((candidate as any)[key]);
            }
          });
        }
      }
    }

    return next(input.child(this, v), v, false);
  }

  public path(currentPath: string): string {
    return `${currentPath}..${this.name}`;
  }
}
