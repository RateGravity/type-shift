import {
  createConverter,
  rootNode,
  ConverterError,
  ConverterErrors,
  missingRootNode
} from 'type-shift';
import { AssertionError } from 'assert';

describe('createConverter', () => {
  it('creates converter with name of function', () => {
    function one() {
      return 1;
    }
    const converter = createConverter(one);
    expect(converter).toHaveProperty('name', 'one');
  });
  it('creates converter with given name', () => {
    function one() {
      return 1;
    }
    const converter = createConverter(one, 'three');
    expect(converter).toHaveProperty('name', 'three');
  });
  it('infers the name of the converter as anonymous', () => {
    const converter = createConverter(() => 1);
    expect(converter).toHaveProperty('name', 'anonymous');
  });

  it('creates a converter that passes through value from node', () => {
    const inner = jest.fn(() => 1);
    const converter = createConverter(inner);
    converter.tryConvertNode(rootNode(1));
    expect(inner).toHaveBeenCalledWith(1);
  });

  it('creates a converter that returns value from response', () => {
    const converter = createConverter(() => 1);
    const result = converter.tryConvertNode(rootNode(2));
    expect(result).toMatchObject({
      success: true,
      value: {
        path: '$',
        parent: null,
        value: 1
      }
    });
  });

  it('creates a converter that errors on empty inputs', () => {
    const converter = createConverter(() => 1, 'value 1');
    const result = converter.tryConvertNode(missingRootNode());
    expect(result).toMatchObject({
      success: false,
      errors: [
        {
          path: '$',
          expected: 'value 1'
        }
      ]
    });
  });

  it('collects thrown errors', () => {
    const converter = createConverter(() => {
      throw new Error('failed');
    }, 'failure');
    const result = converter.tryConvertNode(rootNode(2));
    expect(result).toMatchObject({
      success: false,
      errors: [
        {
          path: '$',
          expected: 'failure',
          actual: 2
        }
      ]
    });
  });

  it('allows converter errors through', () => {
    const converter = createConverter(() => {
      throw new ConverterError('$.foo', 'string', 3);
    }, 'failure');
    const result = converter.tryConvertNode(rootNode(2));
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
    const converter = createConverter(() => {
      throw new ConverterErrors([
        new ConverterError('$.foo', 'string', 3),
        new ConverterError('$.bar', 'number', 'three')
      ]);
    }, 'failure');
    const result = converter.tryConvertNode(rootNode(2));
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
    const converter = createConverter(() => {
      throw new AssertionError({
        actual: 4,
        expected: 6
      });
    }, 'failure');
    const result = converter.tryConvertNode(rootNode(2));
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
