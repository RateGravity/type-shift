import { Converter, ConverterFunction, createConverter, getConverterName } from './core';

/** When used in a patch path signals that the patch applies to all elements of an array */
export const AllElements = Symbol('[*]');
/** When used in patch path signals that the patch applies to all entries in an object */
export const AllEntries = Symbol('.*');

export type PatchTarget = (string | number | typeof AllElements | typeof AllEntries)[];

/**
 * An input Patch.
 *
 * Patches wrap a converter and modify the input (and entity) before invoking the converter
 * they provide a clean way to declare and compose input transformations for things
 * like legacy field mapping or type narrowing.
 */
export type Patch = <TResult>(converter: ConverterFunction<TResult>) => Converter<TResult>;

const apply = (
  target: unknown,
  targetPath: PatchTarget,
  currentPath: (number | string)[],
  update: (v: unknown, path: (number | string)[]) => unknown
): unknown => {
  try {
    if (targetPath.length === 0) {
      return update(target, currentPath);
    } else {
      const [part, ...path] = targetPath;
      if (part === AllElements) {
        const into = target == null || !Array.isArray(target) ? [] : target;
        // apply the patch to every element
        return into.reduce(
          (t: unknown, _, index) => apply(t, [index, ...path], currentPath, update),
          into
        );
      } else if (part === AllEntries) {
        const into = typeof target !== 'object' || target == null ? {} : target;
        // apply the patch to every key
        return Object.keys(into).reduce(
          (t: unknown, key: string) => apply(t, [key, ...path], currentPath, update),
          into
        );
      } else if (typeof part === 'string') {
        // because the current path part is a string we're going to be
        // setting the property on an object.
        const into = target == null || typeof target !== 'object' || target === null ? {} : target;
        const n = (into as Record<string, unknown>)[part];
        const r = apply(n, path, [...currentPath, part], update);
        // optimize copying a whole object if not necessary
        if (n === r) {
          return into;
        } else {
          return {
            ...into,
            [part]: r
          };
        }
      } else {
        // because the current path part is a number we're going to be
        // setting the element of an array
        const into = target == null || !Array.isArray(target) ? [] : target;
        const n = into[part];
        const r = apply(n, path, [...currentPath, part], update);
        // optimize copying a whole array if not necessary
        if (n === r) {
          return into;
        } else {
          return [...into.slice(0, part), r, ...into.slice(part + 1)];
        }
      }
    }
  } catch (_ignore) {
    // errors applying a patch are ignored
    // and the input is returned as-is
    return target;
  }
};

/**
 * Creates a new Patch
 *
 * The patcher converter will be invoked with the input value from the target path, if that converter
 * does not throw an error the result of the converter will be "patched" into the input at the target path.
 * @param targetPath the target property to patch
 * @param patcher a converter function that transforms the value in the input to the patched value.
 * @returns a Patch that can wrap a converter.
 */
export const patch = (
  targetPath: PatchTarget,
  patcher: ConverterFunction<unknown, unknown>
): Patch => {
  return <TResult>(converter: ConverterFunction<TResult>) => {
    return createConverter((input, path, entity) => {
      const bindEntity = (v: unknown, p: (number | string)[]) => patcher(v, p, entity);
      const nextInput = apply(input, targetPath, path, bindEntity);
      // if the entity and the input are not the same then we want to also update the entity.
      // this allows subsequent converters or patches to use things like t.forPath to see the new fields we're creating
      // this is useful when we're apply a series of patches that can be thought of as version upgrades (v1 -> v2 -> v3)
      // after each patch is applied we want to
      const nextEntity =
        input === entity ? nextInput : apply(entity, [...path, ...targetPath], [], bindEntity);
      return converter(nextInput, path, nextEntity);
    }, getConverterName(converter));
  };
};

/**
 * Given a series of patches create a patch that applies them in sequence.
 *
 * This is equivalent to: patch1(patch2(patch3(converter))) but allow this to be written
 * as: patches(patch1, patch2, patch3)(converter) additionally the patches can more easily be applied to multiple converters.
 * @param patches the patches to apply in sequence.
 * @returns a Patch
 */
export const patches = (...patches: Patch[]): Patch => {
  return (converter) => patches.reduceRight((c, p) => p(c), createConverter(converter));
};
