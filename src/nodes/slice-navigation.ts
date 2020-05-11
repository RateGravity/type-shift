import { Node, Navigation, NextNavigation } from './types';
import { flatMap } from '../util';

export class SliceNavigation extends Navigation {
  private readonly pathPart: string;
  private readonly start: number;
  private readonly end?: number;
  private readonly step: number;

  constructor(start: number | undefined, end: number | undefined, step: number | undefined) {
    super();
    this.start = start === undefined ? 0 : start;
    this.end = end;
    this.step = step === undefined ? 1 : step;

    const parts = [];
    parts.push(
      start === undefined ? '' : start.toString(),
      end === undefined ? '' : end.toString()
    );
    if (step !== undefined) {
      parts.push(step.toString());
    }
    this.pathPart = `[${parts.join(':')}]`;
  }

  public navigateNext(
    next: NextNavigation,
    input: Node<unknown>,
    values: unknown[]
  ): Node<unknown> {
    const v = flatMap(values, (value) => {
      if (Array.isArray(value)) {
        const start = this.start < 0 ? value.length + this.start : this.start;
        const end =
          this.end === undefined ? value.length : this.end < 0 ? value.length + this.end : this.end;
        const r = [];
        for (let i = start; this.step < 0 ? i > end : i < end; i = i + this.step) {
          r.push(value[i]);
        }
        return r;
      }
      return [];
    });
    return next(input.child(this, v), v, false);
  }

  public path(currentPath: string): string {
    return `${currentPath}${this.pathPart}`;
  }
}
