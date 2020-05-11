export interface PresentNode<T> {
  /**
   * The Parent node or null if this node is the root node.
   */
  readonly parent: Node<unknown> | null;

  /**
   * The Path to this node, mostly a json path expression
   */
  readonly pathPart: Navigation;

  /**
   * A value, if the value is not present then this Node
   * was constructed from an object without the specified path
   */
  readonly value: T;

  /**
   * True if this node is missing it's value;
   */
  readonly isMissingValue: false;

  /**
   * The complete path from the root to this node
   */
  readonly path: string;

  /**
   * Return a value conditional on if this node is present or missing
   * @param presentCallback
   * @param missingCallback
   */
  ifPresent<V, E>(
    presentCallback: ((node: PresentNode<T>) => V) | V,
    missingCallback: ((node: MissingNode<T>) => E) | E
  ): V | E;

  /**
   * Create a present node with this node as it's parent
   * @param pathPart the path from the parent to the child node
   * @param value the value of the child node
   */
  child<N>(pathPart: string | number | Navigation, value: N): PresentNode<N>;

  /**
   * Create a missing node with this node as it's parent
   * @param pathPart the path from the parent to the child node
   */
  missingChild(pathPart: string | number | Navigation): MissingNode<T>;

  /**
   * Create a present node with the same parent and path
   * @param value the new value
   * @returns a new Node
   */
  setValue<N>(value: N): PresentNode<N>;

  /**
   * Create a missing node with the same parent and path
   * @returns a new Node
   */
  setMissingValue(): MissingNode<T>;
}

export interface MissingNode<T> {
  /**
   * The Parent node or null if this node is the root node.
   */
  readonly parent: Node<unknown> | null;

  /**
   * The Path to this node, mostly a json path expression
   */
  readonly pathPart: Navigation;

  /**
   * True if this node is missing it's value;
   */
  readonly isMissingValue: true;

  /**
   * The complete path from the root to this node
   */
  readonly path: string;

  /**
   * Return a value conditional on if this node is present or missing
   * @param presentCallback
   * @param missingCallback
   */
  ifPresent<V, E>(
    presentCallback: ((node: PresentNode<T>) => V) | V,
    missingCallback: ((node: MissingNode<T>) => E) | E
  ): V | E;

  /**
   * Create a present node with this node as it's parent
   * @param pathPart the path from the parent to the child node
   * @param value the value of the child node
   */
  child<N>(pathPart: string | number | Navigation, value: N): PresentNode<N>;

  /**
   * Create a missing node with this node as it's parent
   * @param pathPart the path from the parent to the child node
   */
  missingChild(pathPart: string | number | Navigation): MissingNode<T>;

  /**
   * Create a present node with the same parent and path
   * @param value the new value
   * @returns a new Node
   */
  setValue<N>(value: N): PresentNode<N>;

  /**
   * Create a missing node with the same parent and path
   * @returns a new Node
   */
  setMissingValue(): MissingNode<T>;
}

export type Node<T> = PresentNode<T> | MissingNode<T>;

export type NextNavigation = (
  input: Node<unknown>,
  values: unknown[],
  exact: boolean
) => Node<unknown>;

export abstract class Navigation {
  /**
   * Internal Node Navigation
   */
  public abstract navigateNext(
    next: NextNavigation,
    input: Node<unknown>,
    values: unknown[],
    exact: boolean
  ): Node<unknown>;

  /**
   * Assembles the Path from a chain of Nodes
   * @param currentPath the path so far.
   */
  public abstract path(currentPath: string): string;

  /**
   * Starting at an input Node return the resulting node after navigating.
   */
  public navigate(input: Node<unknown>): Node<unknown> {
    return this.navigateNext(
      (n) => n,
      input,
      input.ifPresent((n) => [n.value], []),
      true
    );
  }
}
