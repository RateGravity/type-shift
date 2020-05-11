import {
  createDefaultConverter,
  rootNode,
  ConverterError,
  ConverterErrors,
  missingRootNode
} from 'type-shift';
import { AssertionError } from 'assert';

describe('createDefaultConverter', () => {
  it('creates converter with name of function', () => {
    function one() {
      return 1;
    }
    const converter = createDefaultConverter(one);
    expect(converter).toHaveProperty('name', 'one');
  });
  it('creates converter with given name', () => {
    function one() {
      return 1;
    }
    const converter = createDefaultConverter(one, 'three');
    expect(converter).toHaveProperty('name', 'three');
  });
  it('infers the name of the converter as anonymous', () => {
    const converter = createDefaultConverter(() => 1);
    expect(converter).toHaveProperty('name', 'anonymous');
  });
  it('infers the name of the converter as anonymous', () => {
    const converter = createDefaultConverter(1);
    expect(converter).toHaveProperty('name', '1');
  });

  it('creates a converter that is invoked when missing', () => {
    const inner = jest.fn(() => 1);
    const converter = createDefaultConverter(inner);
    converter.tryConvertNode(missingRootNode());
    expect(inner).toHaveBeenCalled();
  });

  it('creates a converter that returns value from response', () => {
    const converter = createDefaultConverter(() => 1);
    const result = converter.tryConvertNode(missingRootNode());
    expect(result).toMatchObject({
      success: true,
      value: {
        path: '$',
        parent: null,
        value: 1
      }
    });
  });

  it('errors when a value is present', () => {
    const converter = createDefaultConverter(1);
    const result = converter.tryConvertNode(rootNode(5 as never));
    expect(result).toMatchObject({
      success: false,
      errors: [
        {
          path: '$',
          expected: 'never',
          actual: 5
        }
      ]
    });
  });

  it('collects thrown errors', () => {
    const converter = createDefaultConverter(() => {
      throw new Error('failed');
    }, 'failure');
    const result = converter.tryConvertNode(missingRootNode());
    expect(result).toMatchObject({
      success: false,
      errors: [
        {
          path: '$',
          expected: 'failure'
        }
      ]
    });
  });

  it('allows ConverterError through', () => {
    const converter = createDefaultConverter(() => {
      throw new ConverterError('$.foo', 'string', 3);
    }, 'failure');
    const result = converter.tryConvertNode(missingRootNode());
    expect(result).toMatchObject({
      success: false,
      errors: [
        {
          path: '$.foo',
          expected: 'string',
          actual: 3
        }
      ]
    });
  });

  it('allows ConverterErrors through', () => {
    const converter = createDefaultConverter(() => {
      throw new ConverterErrors([
        new ConverterError('$.foo', 'string', 3),
        new ConverterError('$.bar', 'number', 'three')
      ]);
    }, 'failure');
    const result = converter.tryConvertNode(missingRootNode());
    expect(result).toMatchObject({
      success: false,
      errors: [
        {
          path: '$.foo',
          expected: 'string',
          actual: 3
        },
        {
          path: '$.bar',
          expected: 'number',
          actual: 'three'
        }
      ]
    });
  });

  it('allows AssertionError through', () => {
    const converter = createDefaultConverter(() => {
      throw new AssertionError({
        actual: 4,
        expected: 6
      });
    }, 'failure');
    const result = converter.tryConvertNode(missingRootNode());
    expect(result).toMatchObject({
      success: false,
      errors: [
        {
          path: '$',
          expected: '6',
          actual: 4
        }
      ]
    });
  });
});
