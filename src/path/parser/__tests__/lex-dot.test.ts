import { lexDot } from '../lex-dot';
import { DotStarNavigation, DotNavigation, DeepNavigation } from '../../../nodes';

describe('lexDot', () => {
  it('lexes .*', () => {
    const tokens = [{ type: 'dot' }, { type: 'star' }, { type: 'end' }];
    const result = lexDot(tokens as any);
    expect(result).toBe(DotStarNavigation);
    expect(tokens).toEqual([{ type: 'end' }]);
  });
  it('lexes .<ident>', () => {
    const tokens = [{ type: 'dot' }, { type: 'raw', value: 'foo' }, { type: 'end' }];
    const result = lexDot(tokens as any);
    expect(result).toBeInstanceOf(DotNavigation);
    expect(tokens).toEqual([{ type: 'end' }]);
  });
  it('lexes ..<ident>', () => {
    const tokens = [
      { type: 'dot' },
      { type: 'dot' },
      { type: 'raw', value: 'foo' },
      { type: 'end' }
    ];
    const result = lexDot(tokens as any);
    expect(result).toBeInstanceOf(DeepNavigation);
    expect(tokens).toEqual([{ type: 'end' }]);
  });
  it('lexes .${ident}', () => {
    const tokens = [{ type: 'dot' }, { type: 'literal', value: 'foo' }, { type: 'end' }];
    const result = lexDot(tokens as any);
    expect(result).toBeInstanceOf(DotNavigation);
    expect(tokens).toEqual([{ type: 'end' }]);
  });
  it('lexes ..${ident}', () => {
    const tokens = [
      { type: 'dot' },
      { type: 'dot' },
      { type: 'literal', value: 'foo' },
      { type: 'end' }
    ];
    const result = lexDot(tokens as any);
    expect(result).toBeInstanceOf(DeepNavigation);
    expect(tokens).toEqual([{ type: 'end' }]);
  });
  it('lexes .foo-${ident}', () => {
    const tokens = [
      { type: 'dot' },
      { type: 'raw', value: 'foo-' },
      { type: 'literal', value: 'foo' },
      { type: 'end' }
    ];
    const result = lexDot(tokens as any);
    expect(result).toBeInstanceOf(DotNavigation);
    expect(tokens).toEqual([{ type: 'end' }]);
  });
  it('lexes ..foo-${ident}', () => {
    const tokens = [
      { type: 'dot' },
      { type: 'dot' },
      { type: 'raw', value: 'foo-' },
      { type: 'literal', value: 'foo' },
      { type: 'end' }
    ];
    const result = lexDot(tokens as any);
    expect(result).toBeInstanceOf(DeepNavigation);
    expect(tokens).toEqual([{ type: 'end' }]);
  });
});
