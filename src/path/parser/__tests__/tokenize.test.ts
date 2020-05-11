import { tokenize } from '../tokenize';

describe('tokenize', () => {
  it('tokenizes an input', () => {
    const result = Array.from(tokenize(['$.', '[0,', '][1:5:.3]'] as any, ['foo', 5]));
    expect(result).toMatchObject([
      { type: 'root' },
      { type: 'dot' },
      { type: 'literal', value: 'foo' },
      { type: 'open' },
      { type: 'raw', value: '0' },
      { type: 'comma' },
      { type: 'literal', value: 5 },
      { type: 'close' },
      { type: 'open' },
      { type: 'raw', value: '1' },
      { type: 'colon' },
      { type: 'raw', value: '5' },
      { type: 'colon' },
      { type: 'dot' },
      { type: 'raw', value: '3' },
      { type: 'close' },
      { type: 'end' }
    ]);
  });
  it('tokenizes an input with zero value substitutions', () => {
    const tree = Array.from(tokenize(['$[', ':', ':', ']'] as any, [5, 0, -1]));
    expect(tree).toMatchObject([
      { type: 'root' },
      { type: 'open' },
      { type: 'literal', value: 5 },
      { type: 'colon' },
      { type: 'literal', value: 0 },
      { type: 'colon' },
      { type: 'literal', value: -1 },
      { type: 'close' },
      { type: 'end' }
    ]);
  });
});
