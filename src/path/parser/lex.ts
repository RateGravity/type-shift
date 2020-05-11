import { Token, TokenError } from './tokens';
import { Navigation } from '../../nodes';
import { lexBase } from './lex-base';
import { lexDot } from './lex-dot';
import { lexBracketed } from './lex-bracketed';

export function* lex(tokens: Token[]): IterableIterator<Navigation> {
  yield* lexBase(tokens);
  while (tokens[0]!.type !== 'end') {
    //peek
    switch (tokens[0].type) {
      case 'open':
        yield lexBracketed(tokens);
        break;
      case 'dot':
        yield lexDot(tokens);
        break;
      default:
        throw new TokenError(tokens[0]);
    }
  }
}
