import { unknown as UnknownConverter } from './basic-types';
import { Converter, ConverterFunction, createConverter, getConverterName } from './core';
import { ConverterError } from './errors';
import { formatPath } from './formatting';

export const CurrentPath = Symbol('.');

export const ParentPath = Symbol('..');

export type TargetPathPart = string | number | typeof CurrentPath | typeof ParentPath;

/**
 * Resolves `targetPath` on `entity. Able to support both relative and absolute paths.
 *
 * @param entity - Entity to traverse.
 * @param targetPath - Targeted path to resolve.
 * @param currentPath - Path of the current converter.
 */
const followPath = (
  entity: unknown,
  targetPath: TargetPathPart[],
  currentPath: (string | number)[]
): [unknown, (string | number)[]] => {
  if (targetPath.length > 0) {
    // Check for relative paths
    switch (targetPath[0]) {
      case CurrentPath:
        // If current, append target path to current path.
        targetPath = [...currentPath, ...targetPath.slice(1)];
        break;
      case ParentPath:
        // If parent, use currentPath minus one level per '..'.
        const count = targetPath.findIndex((part) => part !== ParentPath, 0);

        if (count === -1) {
          // If we go all the way to the root...
          targetPath = [];
        } else {
          // Otherwise return currentPath and targetPath merged.
          targetPath = [
            ...currentPath.slice(0, currentPath.length - count),
            ...targetPath.slice(count)
          ];
        }
        break;
    }
  }
  return [
    targetPath.reduce((e, part) => (e != null ? (e as any)[part] : e), entity as unknown),
    targetPath as (string | number)[]
  ];
};

/**
 * Given a Path and a converter, invoke the converter at the given path
 * from the root entity.
 *
 * This is especially useful for migrating data from old schemas
 * @param targetPath -the path to pull data from
 */
export function forPath(targetPath: TargetPathPart[]): Converter<unknown, unknown>;

/**
 * Given a Path and a converter, invoke the converter at the given path
 * from the root entity.
 *
 * This is especially useful for migrating data from old schemas
 * @param targetPath - the path to pull data from
 * @param converter - the converter to process the data with
 */
export function forPath<Result>(
  targetPath: TargetPathPart[],
  converter: ConverterFunction<Result, unknown>
): Converter<Result, unknown>;

export function forPath(
  targetPath: TargetPathPart[],
  converter: ConverterFunction<unknown, unknown> = UnknownConverter
): Converter<unknown, unknown> {
  return createConverter((_, entityPath, entity) => {
    const [newEntity, newTarget] = followPath(entity, targetPath, entityPath);
    return converter(newEntity, newTarget, entity);
  }, getConverterName(converter));
}

/**
 * Reroot the given converter at its current point in the tree.
 * This effectively causes functions like forPath to
 * be unable to traverse above the current point in the tree. It's useful as a way
 * to re-use converters when you have nested data.
 * @param converter - the converter to process data with
 */
export function sub<Result, Input = unknown>(
  converter: ConverterFunction<Result, Input>
): Converter<Result, Input> {
  return createConverter((value, path) => {
    const basePath = formatPath(path);
    try {
      // invoke the inner converter resetting path and entity
      return converter(value, [], value);
    } catch (err) {
      if (err instanceof ConverterError) {
        // re-root all the paths
        const errorKeys = Object.keys(err.errorFields);
        errorKeys.forEach((key) => {
          // get the error
          const error = err.errorFields[key];
          // delete the existing error
          delete err.errorFields[key];
          // rebuild the root key (excluding the leading $)
          err.errorFields[basePath + key.substr(1)] = error;
        });
      }
      throw err;
    }
  }, getConverterName(converter));
}
