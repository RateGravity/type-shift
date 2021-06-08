import * as t from 'type-shift';

type GameType = 'Hearts' | 'Spades' | 'Skat' | 'Briscola';

const gameTypeConverter = t.oneOf<GameType>(['Hearts', 'Spades', 'Skat', 'Briscola']);

interface GameData {
  gameType: GameType;
  players: {
    id: string;
    tricks: number;
    currentTurn: boolean;
  }[];
}

const gameDataConverter = t.strict<GameData>({
  gameType: gameTypeConverter,
  players: t
    .array(
      t.strict({
        id: t.string,
        tricks: t.number,
        currentTurn: t.boolean
      })
    )
    .pipe((values, path) => {
      if (values.filter(({ currentTurn }) => currentTurn).length !== 1) {
        throw new t.ConverterError(values, 'one player with the current turn', path);
      }
      return values;
    }, 'players one of whom has the current turn')
});

type GameRecords = {
  [gameId: string]: GameData;
};

export const gameRecordsConverter = t
  .record(t.unknown)
  .or(
    // some clients send data as an array with id fields in each record
    // structure to a lookup table.
    t.array(t.shape({ id: t.string })).pipe((values) =>
      values.reduce((acc, { id, ...data }) => {
        acc[id] = data;
        return acc;
      }, {} as Record<string, unknown>)
    )
  )
  .pipe<GameRecords>(t.record(gameDataConverter));
