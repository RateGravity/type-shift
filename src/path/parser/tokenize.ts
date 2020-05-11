import { Token, LiteralValues } from './tokens';

export function* tokenize(
  data: TemplateStringsArray,
  exprs: LiteralValues[]
): IterableIterator<Token> {
  let position = 0;
  for (let t = 0; t < data.length; t++) {
    const toTokenize = data[t];
    for (let i = 0; i < toTokenize.length; i++, position++) {
      const value = toTokenize[i];
      switch (value) {
        case '$':
          yield { type: 'root', value, position };
          break;
        case '@':
          yield { type: 'current', value, position };
          break;
        case '^':
          yield { type: 'parent', value, position };
          break;
        case '*':
          yield { type: 'star', value, position };
          break;
        case '.':
          yield { type: 'dot', value, position };
          break;
        case ':':
          yield { type: 'colon', value, position };
          break;
        case ',':
          yield { type: 'comma', value, position };
          break;
        case '[':
          yield { type: 'open', value, position };
          break;
        case ']':
          yield { type: 'close', value, position };
          break;
        case "'":
          yield { type: 'quote', value, position };
          break;
        case '"':
          yield { type: 'dblQuote', value, position };
          break;
        case ' ':
        case '\t':
        case '\n':
        case '\r':
          yield { type: 'whitespace', value, position };
          break;
        default:
          yield { type: 'raw', value, position };
          break;
      }
    }
    if (t in exprs) {
      yield { type: 'literal', position, value: exprs[t] };
      position++;
    }
  }
  yield { type: 'end', position, value: '' };
}
