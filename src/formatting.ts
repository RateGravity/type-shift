/**
 * Given a path array return a path string
 * @param path the path array comprising of string and number parts
 */
export function formatPath(path: (string | number)[]): string {
  return path
    .map((part) => (typeof part === 'string' ? `.${part}` : `[${part}]`))
    .reduce((l, r) => l + r, '$');
}

/**
 * Determine the printed string for a value
 * @param value a value to print
 */
export function displayValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'bigint':
      return JSON.stringify(value);
    case 'symbol':
      return `@@${value.toString()}`;
    case 'object':
      if (Array.isArray(value)) {
        return `[${value.map((v) => displayValue(v)).join(', ')}]`;
      }
      return `{${Object.keys(value!)
        .map((key) => `${key}: ${displayValue((value as any)[key])}`)
        .join(', ')}}`;
    default:
      return typeof value;
  }
}
