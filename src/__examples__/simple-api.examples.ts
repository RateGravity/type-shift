export const WithAllFieldsPresent = {
  input: {
    id: '12390812031',
    name: 'Patty Player',
    currentRating: 728,
    hasPlayedBefore: true,
    friends: [{ id: '09132901203', name: 'Garry Gamer', currentRating: 700 }],
    activeGameIds: ['812390012']
  },
  output: {
    id: '12390812031',
    name: 'Patty Player',
    currentRating: 728,
    hasPlayedBefore: true,
    friends: [{ id: '09132901203', name: 'Garry Gamer', currentRating: 700 }],
    activeGameIds: ['812390012']
  }
};

export const WithInferredFields = {
  input: {
    id: '12930812031'
  },
  output: {
    id: '12930812031',
    name: 'anonymous',
    currentRating: 0,
    hasPlayedBefore: false,
    friends: [],
    activeGameIds: []
  }
};

export const WithExtraFieldsIgnored = {
  input: {
    id: '1290810231',
    firstName: 'Patty',
    lastName: 'Player'
  },
  output: {
    id: '1290810231',
    name: 'anonymous',
    currentRating: 0,
    hasPlayedBefore: false,
    friends: [],
    activeGameIds: []
  }
};
