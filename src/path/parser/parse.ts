import { LiteralValues } from './tokens';
import { tokenize } from './tokenize';
import { lex } from './lex';
import { Navigation } from '../../nodes';

export function parse(data: TemplateStringsArray, exprs: LiteralValues[]): Navigation[] {
  return Array.from(lex(Array.from(tokenize(data, exprs))));
}
