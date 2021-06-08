/*
 eslint-disable @typescript-eslint/no-var-requires
*/
import * as t from 'type-shift';
import { readdirSync } from 'fs';
import { join } from 'path';

type TestSetup = {
  converter: t.Converter<unknown, unknown>;
  examples: Record<string, { input: unknown; output: unknown }>;
};

describe('examples', () => {
  const exampleDir = join(__dirname, '..', '__examples__');
  describe.each(
    Array.from(
      readdirSync(exampleDir)
        .reduce((lookup: Map<string, TestSetup>, fileName: string) => {
          const [name] = fileName.split('.');
          if (fileName.endsWith('.examples.ts')) {
            const { __esModule: _, ...examples } = require(join(exampleDir, fileName));
            let converter: t.Converter<unknown, unknown> = t.never;
            if (lookup.has(name)) {
              converter = lookup.get(name)!.converter;
            }
            lookup.set(name, {
              converter,
              examples
            });
          } else {
            const { __esModule: _, ...converters } = require(join(exampleDir, fileName));
            const converter = Object.values(converters)[0] as TestSetup['converter'];
            let examples = {};
            if (lookup.has(name)) {
              examples = lookup.get(name)!.examples;
            }
            lookup.set(name, {
              converter,
              examples
            });
          }
          return lookup;
        }, new Map<string, TestSetup>())
        .entries()
    ).map(
      ([name, { converter, examples }]) =>
        [name, converter, examples] as [string, TestSetup['converter'], TestSetup['examples']]
    )
  )(
    '%s',
    (
      _converterName: string,
      converter: TestSetup['converter'],
      examples: TestSetup['examples']
    ) => {
      it.each(Object.keys(examples).map((key) => [key, examples[key].input, examples[key].output]))(
        '%s',
        (_exampleName, input, output) => {
          expect(converter(input)).toEqual(output);
        }
      );
    }
  );
});
