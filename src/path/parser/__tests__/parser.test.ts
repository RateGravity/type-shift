import { parse } from '..';
import {
  RootNavigation,
  DotNavigation,
  BracketedNavigation,
  DeepNavigation,
  DotStarNavigation,
  BracketedStarNavigation,
  SliceNavigation,
  PredicateNavigation
} from '../../../nodes';
import { CurrentNavigation } from '../../current-navigation';
import { TokenError } from '../tokens';

describe('parse', () => {
  it('parses a json path', () => {
    const tree = parse([`$.foo.bar[0]..baz[1,2,3]["test",'test'].*[*][1:5:2]`] as any, []);
    expect(tree).toHaveLength(10);
    expect(tree[0]).toBe(RootNavigation);
    expect(tree[1]).toBeInstanceOf(DotNavigation);
    expect(tree[2]).toBeInstanceOf(DotNavigation);
    expect(tree[3]).toBeInstanceOf(BracketedNavigation);
    expect(tree[4]).toBeInstanceOf(DeepNavigation);
    expect(tree[5]).toBeInstanceOf(BracketedNavigation);
    expect(tree[6]).toBeInstanceOf(BracketedNavigation);
    expect(tree[7]).toBe(DotStarNavigation);
    expect(tree[8]).toBe(BracketedStarNavigation);
    expect(tree[9]).toBeInstanceOf(SliceNavigation);
  });
  it('parses a json path with templated values', () => {
    const tree = parse(['@.', '[', '][', ':', '][', ']'] as any, [
      'foo',
      [1, 2, 3],
      0,
      5,
      () => true
    ]);
    expect(tree).toHaveLength(5);
    expect(tree[0]).toBe(CurrentNavigation);
    expect(tree[1]).toBeInstanceOf(DotNavigation);
    expect(tree[2]).toBeInstanceOf(BracketedNavigation);
    expect(tree[3]).toBeInstanceOf(SliceNavigation);
    expect(tree[4]).toBeInstanceOf(PredicateNavigation);
  });
  it('parses a path with zero value substituations', () => {
    const tree = parse(['$[', ':', ':', ']'] as any, [5, 0, -1]);
    expect(tree).toHaveLength(2);
    expect(tree[1]).toBeInstanceOf(SliceNavigation);
    expect(tree[1].path('')).toBe('[5:0:-1]');
  });
  describe('errors', () => {
    it('throws with base-less paths', () => {
      expect(() => parse(['foo.bar'] as any, [])).toThrowError(TokenError);
    });
    it('throws with unterminated strings', () => {
      expect(() => parse([`$['foo].bar`] as any, [])).toThrowError(TokenError);
    });
    it('throws with unterminated brackets', () => {
      expect(() => parse([`$['foo'.bar`] as any, [])).toThrowError(TokenError);
    });
    it('throws with repeated calls to current', () => {
      expect(() => parse(['@.@.@.@'] as any, [])).toThrowError(TokenError);
    });
  });
});
