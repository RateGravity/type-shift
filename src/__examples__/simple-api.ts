import * as t from 'type-shift';

interface User {
  id: string;
  name: string;
  currentRating: number;
  hasPlayedBefore: boolean;
  friends: Pick<User, 'id' | 'name' | 'currentRating'>[];
  activeGameIds: string[];
}

const simpleUserConverter = t.strict({
  id: t.string,
  name: t.string.default(() => 'anonymous'),
  currentRating: t.number
    .pipe((value, path) => {
      if (value < 0 || value > 1000) {
        throw new t.ConverterError(value, 'number between 0 and 1000', path);
      }
      return value;
    }, 'number between 0 and 1000')
    .default(() => 0) // default to 0
});

export const userConverter = t.strict<User>({
  ...simpleUserConverter.converters,
  hasPlayedBefore: t.boolean.default(() => false),
  friends: t.array(simpleUserConverter).default(() => []),
  activeGameIds: t.array(t.string).default(() => [])
});
