import { Token, TokenError } from './tokens';
import {
  Navigation,
  BracketedStarNavigation,
  BracketedNavigation,
  PredicateNavigation,
  SliceNavigation
} from '../../nodes';

function shiftWhitespace(tokens: Token[]): void {
  let token = tokens.shift()!;
  while (token.type === 'whitespace') {
    token = tokens.shift()!;
  }
  tokens.unshift(token);
}

function lexNumber(tokens: Token[]): number {
  let token = tokens.shift()!;
  const firstToken = token;
  let s = '';
  let oneDot = false;
  for (; tokens.length > 0; token = tokens.shift()!) {
    if (token.type === 'dot' && !oneDot) {
      oneDot = true;
      s = s + token.value;
    } else if (token.type === 'raw') {
      s = s + token.value;
    } else {
      break;
    }
  }
  const n = Number(s);
  if (isNaN(n)) {
    throw new TokenError(firstToken);
  } else {
    tokens.unshift(token);
    return n;
  }
}

function lexString(tokens: Token[]): string {
  const quoteMark = tokens.shift()!;
  if (quoteMark.type !== 'quote' && quoteMark.type !== 'dblQuote') {
    throw new TokenError(quoteMark);
  }
  let s = '';
  let token = tokens.shift()!;
  while (token.type !== quoteMark.type) {
    // error if we reach the end of the string
    if (token.type === 'end') {
      throw new TokenError(token);
    }
    // otherwise just append the value
    s = s + token.value.toString();
    token = tokens.shift()!;
  }
  return s;
}

function lexSlice(start: number | undefined, tokens: Token[]): Navigation {
  const args = {
    end: undefined as number | undefined,
    step: undefined as number | undefined
  };
  let arg: keyof typeof args = 'end';
  let token = tokens.shift()!;
  while (token.type !== 'close') {
    if (token.type === 'colon' && arg === 'end') {
      arg = 'step';
    } else if (args[arg] !== undefined) {
      // repeated numbers ie [1:3-5] are illegal
      throw new TokenError(token);
    } else if (token.type === 'literal' && typeof token.value === 'number') {
      args[arg] = token.value;
    } else if (token.type === 'raw') {
      tokens.unshift(token);
      args[arg] = lexNumber(tokens);
    } else {
      throw new TokenError(token);
    }
    token = tokens.shift()!;
  }
  return new SliceNavigation(start, args.end, args.step);
}

function lexIndexes(values: Array<number | string>, tokens: Token[]): Navigation {
  shiftWhitespace(tokens);
  let token = tokens.shift()!;
  while (token.type !== 'close') {
    // find comma
    if (token.type !== 'comma') {
      throw new TokenError(token);
    }
    shiftWhitespace(tokens);
    token = tokens.shift()!;
    switch (token.type) {
      case 'raw':
        tokens.unshift(token);
        values.push(lexNumber(tokens));
        break;
      case 'dblQuote':
      case 'quote':
        tokens.unshift(token);
        values.push(lexString(tokens));
        break;
      case 'literal':
        if (
          Array.isArray(token.value) &&
          token.value.every((t) => typeof t === 'number' || typeof t === 'string')
        ) {
          values.push(...token.value);
          break;
        }
        if (typeof token.value === 'string' || typeof token.value === 'number') {
          values.push(token.value);
          break;
        }
        throw new TokenError(token);
      default:
        throw new TokenError(token);
    }
    shiftWhitespace(tokens);
    token = tokens.shift()!;
  }
  return new BracketedNavigation(values);
}

export function lexBracketed(tokens: Token[]): Navigation {
  let token = tokens.shift()!;
  // first token has to be [
  if (token.type !== 'open') {
    throw new TokenError(token);
  }
  shiftWhitespace(tokens);
  let value: number;
  token = tokens.shift()!;
  switch (token.type) {
    case 'close':
      return new BracketedNavigation([]); // empty, ideally we'd warn here
    case 'star':
      token = tokens.shift()!;
      if (token.type !== 'close') {
        throw new TokenError(token);
      }
      return BracketedStarNavigation;
    case 'literal':
      if (typeof token.value === 'function') {
        const closeToken = tokens.shift()!;
        if (closeToken.type !== 'close') {
          throw new TokenError(closeToken);
        }
        return new PredicateNavigation(token.value);
      }
      if (typeof token.value === 'string') {
        return lexIndexes([token.value], tokens);
      }
      if (
        Array.isArray(token.value) &&
        token.value.every((t) => typeof t === 'number' || typeof t === 'string')
      ) {
        return lexIndexes([...token.value], tokens);
      }
      if (typeof token.value === 'number') {
        value = token.value;
      }
      break;
    case 'colon':
      return lexSlice(undefined, tokens);
    case 'raw':
      tokens.unshift(token);
      value = lexNumber(tokens);
      break;
    case 'dblQuote':
    case 'quote':
      tokens.unshift(token);
      return lexIndexes([lexString(tokens)], tokens);
    default:
      throw new TokenError(token);
  }
  shiftWhitespace(tokens);
  token = tokens.shift()!;
  if (token.type === 'colon') {
    return lexSlice(value!, tokens);
  }
  if (token.type === 'comma' || token.type === 'close' || token.type === 'whitespace') {
    tokens.unshift(token);
    return lexIndexes([value!], tokens);
  }
  throw new TokenError(token);
}
