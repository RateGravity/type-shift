import { Token, TokenError } from './tokens';
import { Navigation, RootNavigation } from '../../nodes';
import { CurrentNavigation } from '../current-navigation';
import { ParentNavigation } from '../parent-navigation';

export function* lexBase(tokens: Token[]): Iterable<Navigation> {
  let token: Token = tokens.shift()!;
  if (token.type === 'root') {
    yield RootNavigation;
    return;
  } else if (token.type === 'current') {
    yield CurrentNavigation;
    return;
  } else if (token.type === 'parent') {
    while (true) {
      yield ParentNavigation;
      const dot = tokens.shift()!;
      if (dot.type === 'dot') {
        token = tokens.shift()!;
        if (token.type === 'parent') {
          // emit another cycle to Parent Navigation
          continue;
        }
        tokens.unshift(token);
      }
      tokens.unshift(dot);
      break;
    }
  } else {
    throw new TokenError(token);
  }
}
