export function mapValues<I extends any[], T>(
  input: I,
  transform: (value: I extends (infer V)[] ? V : never, key: number, obj: I) => T
): T[];
export function mapValues<I extends object, T>(
  input: I,
  transform: (value: I[keyof I], key: keyof I, obj: I) => T
): { [K in keyof I]: T };
export function mapValues(input: any, transform: (value: any, key: any, obj: any) => any): any {
  if (Array.isArray(input)) {
    const acc: any[] = [];
    input.forEach((v, i) => {
      acc[i] = transform(v, i, input);
    });
    return acc;
  } else {
    const acc = {} as Record<string, any>;
    Object.keys(input).forEach((k) => {
      (acc as any)[k] = transform((input as any)[k], k, input);
    });
    return acc;
  }
}

export function filterValues<I extends any[]>(
  input: I,
  predicate: (value: I extends (infer V)[] ? V : never, key: number, obj: I) => boolean
): I;
export function filterValues<I extends object>(
  input: I,
  predicate: (value: I[keyof I], key: keyof I, obj: I) => boolean
): { [K in keyof I]?: I[K] };
export function filterValues(
  input: any,
  predicate: (value: any, key: any, obj: any) => boolean
): any {
  if (Array.isArray(input)) {
    const acc: any[] = [];
    input.forEach((v, i) => {
      if (predicate(v, i, input)) {
        acc[i] = v;
      }
    });
    return acc;
  } else {
    const acc = {} as Record<string, any>;
    Object.keys(input).forEach((k) => {
      if (predicate((input as any)[k], k, input)) {
        (acc as any)[k] = (input as any)[k];
      }
    });
    return acc;
  }
}

export function values<I extends object>(
  input: I
): Array<I extends Array<infer V> ? V : I[keyof I]> {
  if (Array.isArray(input)) {
    return input;
  } else if (('values' in Object) as any) {
    return Object.values(input);
  } else {
    return Object.keys(input).map((k) => (input as any)[k]);
  }
}

export function flatMap<T, V>(input: T[], transform: (v: T, i: number, input: T[]) => V[]): V[] {
  if (('flatMap' in input) as any) {
    return input.flatMap(transform);
  }
  const acc: V[] = [];
  input.forEach((v, i) => {
    acc.push(...transform(v, i, input));
  });
  return acc;
}
