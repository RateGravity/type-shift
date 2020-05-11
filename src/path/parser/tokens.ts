export type Predicate = (value: unknown, key: number | string, entity: object) => boolean;
export type LiteralValues = string | number | Array<number | string> | Predicate;

export type Token =
  | { type: 'root'; position: number; value: '$' }
  | { type: 'current'; position: number; value: '@' }
  | { type: 'parent'; position: number; value: '^' }
  | { type: 'star'; position: number; value: '*' }
  | { type: 'dot'; position: number; value: '.' }
  | { type: 'colon'; position: number; value: ':' }
  | { type: 'comma'; position: number; value: ',' }
  | { type: 'open'; position: number; value: '[' }
  | { type: 'close'; position: number; value: ']' }
  | { type: 'quote'; position: number; value: "'" }
  | { type: 'dblQuote'; position: number; value: '"' }
  | { type: 'raw'; position: number; value: string }
  | { type: 'whitespace'; position: number; value: string }
  | { type: 'literal'; position: number; value: LiteralValues }
  | { type: 'end'; position: number; value: '' };

export class TokenError extends SyntaxError {
  constructor(token: Token) {
    super(`Unexpected token ${token.type}:${token.value} at position ${token.position}`);
  }
}
