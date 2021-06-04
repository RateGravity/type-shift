import * as t from 'type-shift';

const itConverts = (converterFactory: any, input: any, output: any) => {
  it(`converts ${JSON.stringify(input)} to ${JSON.stringify(output)}`, () => {
    const c = converterFactory(() => 1);
    expect(c(input, [], {})).toBe(output);
  });
};

const itFailsConverting = (converterFactory: any, input: any) => {
  it(`fails converting ${JSON.stringify(input)}`, () => {
    const c = converterFactory(t.number);
    expect(() => c(input, [], {})).toThrow();
  });
};

const itPassesValueToInnerConverter = (converterFactory: any) => {
  it('passes defined values to inner converter', () => {
    const inner = jest.fn(() => 1);
    const path = ['foo'];
    const entity = {};
    expect(converterFactory(inner)(3, path, entity)).toBe(1);
    expect(inner).toHaveBeenCalledWith(3, path, entity);
  });
};

describe('optional', () => {
  itConverts(t.optional, undefined, undefined);
  itFailsConverting(t.optional, null);
  itPassesValueToInnerConverter(t.optional);
});

describe('noneable', () => {
  itConverts(t.noneable, undefined, undefined);
  itConverts(t.noneable, null, null);
  itPassesValueToInnerConverter(t.noneable);
});

describe('noneableAsNull', () => {
  itConverts(t.noneableAsNull, undefined, null);
  itConverts(t.noneableAsNull, null, null);
  itPassesValueToInnerConverter(t.noneableAsNull);
});

describe('noneableAsUndefined', () => {
  itConverts(t.noneableAsUndefined, undefined, undefined);
  itConverts(t.noneableAsUndefined, null, undefined);
  itPassesValueToInnerConverter(t.noneableAsUndefined);
});
