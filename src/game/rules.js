// src/game/rules.js
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const STORM_START_POSITION = 12;

// Random board position (0-24) that is not the storm's starting tile.
export function getRandomInt(min, max) {
  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (randomNumber === STORM_START_POSITION);
  return randomNumber;
}

// [minimum storm level, cards to draw], highest first, per player-count bracket.
const CARDS_TO_DRAW = {
  small: [[14, 7], [12, 6], [9, 5], [5, 4], [2, 3]], // 1-2 players
  medium: [[15, 7], [13, 6], [10, 5], [6, 4], [2, 3]], // 3-4 players
  large: [[16, 7], [14, 6], [11, 5], [7, 4], [2, 3]], // 5-6 players
};

export function getCardsToDraw(stormLevel, noOfPlayers) {
  const bracket = noOfPlayers <= 2 ? 'small' : noOfPlayers <= 4 ? 'medium' : 'large';
  const row = CARDS_TO_DRAW[bracket].find(([minLevel]) => stormLevel >= minLevel);
  return row ? row[1] : 2;
}
