import { lexBracketed } from '../lex-bracketed';
import { BracketedNavigation, SliceNavigation } from '../../../nodes';

describe('lexBracketed', () => {
  it('lexes multi-valued strings', () => {
    const navigation = lexBracketed([
      { type: 'open', position: 0, value: '[' },
      { type: 'quote', position: 1, value: "'" },
      { type: 'raw', position: 2, value: 'test' },
      { type: 'quote', position: 6, value: "'" },
      { type: 'comma', position: 7, value: ',' },
      { type: 'quote', position: 8, value: "'" },
      { type: 'raw', position: 9, value: 'not-test' },
      { type: 'quote', position: 17, value: "'" },
      { type: 'close', position: 18, value: ']' },
      { type: 'end', position: 19, value: '' }
    ]);
    expect(navigation).toBeInstanceOf(BracketedNavigation);
  });

  it('lexes slices with number substitutions', () => {
    const navigation = lexBracketed([
      { type: 'open', position: 0, value: '[' },
      { type: 'literal', position: 1, value: 0 },
      { type: 'colon', position: 2, value: ':' },
      { type: 'raw', position: 3, value: '3' },
      { type: 'colon', position: 4, value: ':' },
      { type: 'close', position: 5, value: ']' },
      { type: 'end', position: 6, value: '' }
    ]);
    expect(navigation).toBeInstanceOf(SliceNavigation);
  });

  it('lexes with substituted zeros', () => {
    const navigation = lexBracketed([
      { type: 'open', position: 0, value: '[' },
      { type: 'literal', position: 1, value: 0 },
      { type: 'colon', position: 2, value: ':' },
      { type: 'literal', position: 3, value: 0 },
      { type: 'colon', position: 4, value: ':' },
      { type: 'literal', position: 5, value: 0 },
      { type: 'close', position: 6, value: ']' },
      { type: 'end', position: 7, value: '' }
    ]);
    expect(navigation.path('')).toBe('[0:0:0]');
  });
});
