import {
  Converter,
  Node,
  ConverterError,
  ConverterResult,
  missingRootNode,
  rootNode
} from 'type-shift';

class TestHarness extends Converter<unknown, unknown> {
  public readonly name: string;
  public readonly convertFunction: jest.Mock<ConverterResult<Node<unknown>>, [Node<unknown>]>;

  constructor(name: string = 'test-harness') {
    super();
    this.name = name;
    this.convertFunction = jest.fn();
  }

  public tryConvertNode(input: Node<unknown>): ConverterResult<Node<unknown>> {
    return this.convertFunction(input);
  }
}

describe('Converter', () => {
  describe('convert', () => {
    it('passes data to tryConverterNode as root', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(5)
      });

      t.convert(7);

      expect(t.convertFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: null,
          path: '$',
          value: 7
        })
      );
    });
    it('returns data from tryConverterNode', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(5)
      });

      const result = t.convert(7);

      expect(result).toBe(5);
    });
    it('throws single returned error', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: false,
        errors: [new ConverterError('$.foo', 'foo', 'bar')]
      });

      expect(() => t.convert(5)).toThrow(ConverterError);
    });
  });

  describe('tryConvert', () => {
    it('passes data to tryConverterNode as root', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(5)
      });

      t.tryConvert(7);

      expect(t.convertFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: null,
          path: '$',
          value: 7
        })
      );
    });
    it('returns data from tryConverterNode', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(5)
      });

      const result = t.tryConvert(7);

      expect(result).toEqual({ success: true, value: 5 });
    });
    it('returns errors from tryConvertNode', () => {
      const errorResponse = {
        success: false as const,
        errors: [new ConverterError('$.foo', 'foo', 'bar')]
      };
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce(errorResponse);

      const result = t.tryConvert(7);

      expect(result).toEqual(errorResponse);
    });
  });

  describe('pipe', () => {
    it('pipes data into the next converter', () => {
      const firstResult = rootNode(3);
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({ success: true, value: firstResult });
      const p = new TestHarness();
      p.convertFunction.mockReturnValueOnce({ success: true, value: rootNode(7) });
      const piped = t.pipe(p);

      piped.tryConvertNode(rootNode(5));

      expect(p.convertFunction).toHaveBeenCalledWith(firstResult);
    });
    it('creates a converter from a function', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({ success: true, value: rootNode(1) });
      const p = jest.fn(() => 6);
      const piped = t.pipe(p);

      piped.tryConvertNode(rootNode(0));

      expect(p).toHaveBeenCalledWith(1);
    });
    it('chains name of piped converter', () => {
      const t = new TestHarness('test-1');
      const n = new TestHarness('test-2');

      const p = t.pipe(n);

      expect(p.name).toBe('test-1 -> test-2');
    });
    it('uses given name for piped function', () => {
      const t = new TestHarness('test-1');
      const n = new TestHarness('test-2');

      const p = t.pipe(n, 'chained-test');

      expect(p.name).toBe('chained-test');
    });
  });

  describe('default', () => {
    it(`default falls back on missing value`, () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(0)
      });
      const d = new TestHarness();
      d.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(5)
      });
      const n = t.default(d);

      n.tryConvertNode(missingRootNode());

      expect(t.convertFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: null,
          path: '$',
          value: 5
        })
      );
    });
    it('default doesnt call default converter without missing value', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(0)
      });
      const d = new TestHarness();
      d.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(5)
      });
      const n = t.default(d);

      n.tryConvertNode(rootNode(1));

      expect(d.convertFunction).not.toHaveBeenCalled();
    });
    it('accepts functions for default value converter', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(0)
      });
      const n = t.default(() => 5);

      n.tryConvertNode(missingRootNode());

      expect(t.convertFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: null,
          path: '$',
          value: 5
        })
      );
    });

    it('accepts values for default value converter', () => {
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(0)
      });
      const n = t.default(7);

      n.tryConvertNode(missingRootNode());

      expect(t.convertFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: null,
          path: '$',
          value: 7
        })
      );
    });

    it('appends names', () => {
      const t = new TestHarness('test');
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(0)
      });
      const n = t.default('test');

      expect(n.name).toBe('test default "test"');
    });

    it('returns error from the default value converter', () => {
      const errorResponse = {
        success: false as const,
        errors: [new ConverterError('$.foo', 'number', 'test')]
      };
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(0)
      });
      const d = new TestHarness();
      d.convertFunction.mockReturnValueOnce(errorResponse);
      const n = t.default(d);

      const r = n.tryConvertNode(missingRootNode());

      expect(r).toEqual(errorResponse);
    });

    it('returns error from the value converter', () => {
      const errorResponse = {
        success: false as const,
        errors: [new ConverterError('$.foo', 'number', 'test')]
      };
      const t = new TestHarness();
      t.convertFunction.mockReturnValueOnce(errorResponse);
      const d = new TestHarness();
      d.convertFunction.mockReturnValueOnce({
        success: true,
        value: rootNode(0)
      });
      const n = t.default(d);

      const r = n.tryConvertNode(missingRootNode());

      expect(r).toEqual(errorResponse);
    });
  });
});
