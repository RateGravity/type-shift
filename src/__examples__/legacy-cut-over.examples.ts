export const TheLatestApi = {
  input: {
    id: '123980123',
    name: 'Betty Briscola',
    currentRating: 800,
    activeGames: [
      { id: '129098034', gameType: 'Briscola' },
      { id: '098098034', gameType: 'Briscola' }
    ],
    favoriteGames: ['Briscola']
  },
  output: {
    id: '123980123',
    name: 'Betty Briscola',
    currentRating: 800,
    activeGames: [
      { id: '129098034', gameType: 'Briscola' },
      { id: '098098034', gameType: 'Briscola' }
    ],
    favoriteGames: ['Briscola']
  }
};

export const LegacyRecord = {
  input: {
    id: '9022982389',
    name: 'Snyder Spades',
    currentRating: 500,
    activeGames: ['8902789234|spades', '129080123|spades'],
    favoriteSpades: true,
    favoriteHearts: null
  },
  output: {
    id: '9022982389',
    name: 'Snyder Spades',
    currentRating: 500,
    activeGames: [
      { id: '8902789234|spades', gameType: 'Spades' },
      { id: '129080123|spades', gameType: 'Spades' }
    ],
    favoriteGames: ['Spades']
  }
};

export const PartiallyCutOver = {
  input: {
    id: '9080820398',
    name: 'Henrietta Hearts',
    currentRating: 976,
    activeGames: ['90809803|hearts', { id: '19208903', gameType: 'Hearts' }],
    favoriteGames: ['Hearts']
  },
  output: {
    id: '9080820398',
    name: 'Henrietta Hearts',
    currentRating: 976,
    activeGames: [
      { id: '90809803|hearts', gameType: 'Hearts' },
      { id: '19208903', gameType: 'Hearts' }
    ],
    favoriteGames: ['Hearts']
  }
};

export const NonLegacyDefaults = {
  input: {
    id: '1980290',
    name: 'Nathaniel New'
  },
  output: {
    id: '1980290',
    name: 'Nathaniel New',
    currentRating: 0,
    activeGames: [],
    favoriteGames: []
  }
};
