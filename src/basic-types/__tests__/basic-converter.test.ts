import * as t from 'type-shift';

describe('basic converters', () => {
  const basicPass = new (class extends t.BasicConverter<unknown, unknown> {
    public readonly name = 'pass';
    protected tryConvertPresentNode(
      node: t.PresentNode<unknown>
    ): t.ConverterResult<t.Node<unknown>> {
      return t.success(node);
    }
  })();

  const basicFail = new (class extends t.BasicConverter<unknown, unknown> {
    public readonly name = 'fail';
    protected tryConvertPresentNode(
      node: t.PresentNode<unknown>
    ): t.ConverterResult<t.Node<unknown>> {
      return t.failed(new t.ConverterError(node.path, 'nothing', node.value));
    }
  })();

  it('ors two passing converters to create a passing converter', () => {
    const c = basicPass.or(basicPass);
    expect(c.tryConvert(5)).toMatchObject({ success: true });
  });

  it('ors two failing converters to create a failing converter', () => {
    const c = basicFail.or(basicFail);
    expect(c.tryConvert(5)).toMatchObject({ success: false });
  });

  it('ors a failing converter and passing converter to create a passing converter', () => {
    const c = basicFail.or(basicPass);
    expect(c.tryConvert(5)).toMatchObject({ success: true });
  });

  it('combines converter names', () => {
    const c = basicFail.or(basicPass);
    expect(c.name).toBe('fail | pass');
  });
});
