import { Token, TokenError } from './tokens';
import { Navigation, DeepNavigation, DotStarNavigation, DotNavigation } from '../../nodes';

function lexIdentifier(tokens: Token[]): string {
  let token = tokens.shift()!;
  let name = '';
  // tokens are make up of $,:, raw values, or anything escaped through a literal
  while (
    token.type === 'raw' ||
    token.type === 'root' ||
    token.type === 'literal' ||
    token.type === 'colon'
  ) {
    // tokens cannot start with a number
    if (name === '' && token.type === 'raw' && token.value.match(/^[0-9]/g)) {
      throw new TokenError(token);
    }
    name += token.value.toString();
    token = tokens.shift()!;
  }
  // empty sting is not valid
  if (name === '') {
    throw new TokenError(token);
  }
  tokens.unshift(token);
  return name;
}

export function lexDot(tokens: Token[]): Navigation {
  let token = tokens.shift()!;
  if (token.type !== 'dot') {
    throw new TokenError(token);
  }
  token = tokens.shift()!;
  // double dot deep navigation
  if (token.type === 'dot') {
    return new DeepNavigation(lexIdentifier(tokens));
  } else if (token.type === 'star') {
    return DotStarNavigation;
  } else {
    // replace and parse
    tokens.unshift(token);
    return new DotNavigation(lexIdentifier(tokens));
  }
}
