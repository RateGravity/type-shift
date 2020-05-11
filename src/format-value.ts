export function formatValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  switch (typeof value) {
    case 'number':
    case 'boolean':
    case 'bigint':
    case 'string':
      return JSON.stringify(value);
    case 'symbol':
      return `@@${value.toString()}`;
    case 'object':
      if (Array.isArray(value)) {
        return `[${value.map(formatValue).join(', ')}]`;
      } else {
        return `{${Object.keys(value!)
          .map((key) => `${key}: ${formatValue((value as any)[key])}`)
          .join(', ')}}`;
      }
  }
  return typeof value;
}
