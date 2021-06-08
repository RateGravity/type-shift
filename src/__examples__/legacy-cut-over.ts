import * as t from 'type-shift';

type GameType = 'Hearts' | 'Spades' | 'Skat' | 'Briscola';

const gameTypeConverter = t.oneOf<GameType>(['Hearts', 'Spades', 'Skat', 'Briscola']);

interface Game {
  id: string;
  gameType: GameType;
}

const gameConverter = t
  .strict<Game>({
    id: t.string,
    gameType: gameTypeConverter
  })
  .or(
    // legacy we used to just put the type of the game
    // after a pipe on the id, when we added Briscola we stopped doing this.
    t.string.pipe<Game>((id, path) => {
      const [_, gameType] = id.split('|');
      switch (gameType) {
        case 'hearts':
          return {
            id,
            gameType: 'Hearts'
          };
        case 'spades':
          return {
            id,
            gameType: 'Spades'
          };
        case 'skat':
          return {
            id: 'skat',
            gameType: 'Skat'
          };
        default:
          throw new t.ConverterError(id, 'id ending in |hearts|spades|skat', path);
      }
    })
  );

interface User {
  id: string;
  name: string;
  currentRating: number;
  activeGames: Game[];
  favoriteGames: GameType[];
}

export const userConverter = t.strict<User>({
  id: t.string,
  name: t.string,
  currentRating: t.number
    .pipe((value, path) => {
      if (value < 0 || value > 1000) {
        throw new t.ConverterError(value, 'number between 0 and 1000', path);
      }
      return value;
    }, 'number between 0 and 1000')
    .default(() => 0),
  activeGames: t.array(gameConverter).default(() => []),
  favoriteGames: t.array(gameTypeConverter).default(
    t.forPath(
      [t.ParentPath],
      // we used to just have favoriteX properties for every game directly on the user object, this is terrible.
      // we can get the game type by finding all the truethy values and dropping the first 8 characters.
      t
        .strict({
          favoriteHearts: t.boolean.default(() => false).or(t.null),
          favoriteSpades: t.boolean.default(() => false).or(t.null),
          favoriteSkat: t.boolean.default(() => false).or(t.null)
        })
        .pipe((options) => {
          return (Object.keys(options) as Array<keyof typeof options>)
            .filter((k) => options[k])
            .map((k) => k.substr(8));
        })
    )
  )
});
