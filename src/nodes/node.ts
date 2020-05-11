import { BracketedNavigation } from './bracketed-navigation';
import { Navigation, Node, PresentNode, MissingNode } from './types';
import { DotNavigation } from './dot-navigation';
import { RootNavigation } from './root-navigation';

class NodeImpl<T> {
  public readonly parent: Node<unknown> | null;
  public readonly pathPart: Navigation;
  public readonly isMissingValue: boolean;
  public readonly value?: T;

  constructor(
    parent: Node<unknown> | null,
    pathPart: string | number | Navigation,
    isMissingValue: boolean,
    value?: T
  ) {
    this.parent = parent;
    this.pathPart =
      typeof pathPart === 'number'
        ? new BracketedNavigation([pathPart])
        : typeof pathPart === 'string'
        ? pathPart.includes('.')
          ? new BracketedNavigation([pathPart])
          : new DotNavigation(pathPart)
        : pathPart;
    this.isMissingValue = isMissingValue;
    if (!this.isMissingValue) {
      this.value = value;
    }
  }

  public get path(): string {
    return this.pathPart.path(this.parent === null ? '' : this.parent.path);
  }

  public ifPresent<V, E>(
    presentCallback: ((node: PresentNode<T>) => V) | V,
    missingCallback: ((node: MissingNode<T>) => E) | E
  ): V | E {
    if (this.isMissingValue) {
      return typeof missingCallback === 'function'
        ? (missingCallback as (node: MissingNode<T>) => E)(this as MissingNode<T>)
        : missingCallback;
    } else {
      return typeof presentCallback === 'function'
        ? (presentCallback as (node: PresentNode<T>) => V)(this as PresentNode<T>)
        : presentCallback;
    }
  }

  public child<N>(pathPart: string | number | Navigation, value: N): PresentNode<N> {
    return new NodeImpl(this as Node<unknown>, pathPart, false, value) as PresentNode<N>;
  }

  public missingChild(pathPart: string | number | Navigation): MissingNode<T> {
    return new NodeImpl(this as Node<unknown>, pathPart, true) as MissingNode<T>;
  }

  setValue<N>(value: N): PresentNode<N> {
    return new NodeImpl(this.parent, this.pathPart, false, value) as PresentNode<N>;
  }

  setMissingValue(): MissingNode<T> {
    return new NodeImpl(this.parent, this.pathPart, true) as MissingNode<T>;
  }
}

/**
 * Create a Root Node with the given value
 */
export function rootNode<T>(value: T): PresentNode<T> {
  return new NodeImpl(null, RootNavigation, false, value) as PresentNode<T>;
}

const MISSING_ROOT = new NodeImpl(null, RootNavigation, true) as MissingNode<any>;

/**
 * Create a Root Node with a missing value
 */
export function missingRootNode<T = never>(): MissingNode<T> {
  return MISSING_ROOT;
}
