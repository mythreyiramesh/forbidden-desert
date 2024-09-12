// src/contexts/GameStateProvider.js
import React, { createContext, useContext, useReducer } from 'react';
import stormCardsData from '../stormCards.json';

const GameStateContext = createContext();
// const initialState = {
//   tiles: [], // Array of 24 tiles
//   players: [], // Array of player objects
//   stormLevel: 0,
//   sandPile: 48, // Initial number of sand tokens
//   currentPlayer: 0,
// };
// src/contexts/GameStateProvider.js

// ... (previous imports and code)

const initialState = {

  tiles: (() => {
    // Create and shuffle desertIDs
    const desertIDs = Array.from({ length: 24 }, (_, i) => i + 1);
    for (let i = desertIDs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [desertIDs[i], desertIDs[j]] = [desertIDs[j], desertIDs[i]];
    }

    let desertIDIndex = 0;

    return Array(25).fill(null).map((_, index) => {
      const baseTile = {
        id: index,
        type: index === 12 ? 'storm' : 'normal', // Center tile (index 12) is the storm
        sandLevel: 0,
        excavated: false,
      };

      const indicesToModify = [2, 6, 8, 10, 14, 16, 18, 22];
      const sandLevelToSet = 1; // You can adjust this value as needed

      if (indicesToModify.includes(index)) {
        baseTile.sandLevel = sandLevelToSet;
      }

      // Add desertID only to normal tiles
      if (baseTile.type === 'normal') {
        baseTile.desertID = desertIDs[desertIDIndex++];
      }

      return baseTile;
    });
  })(),
  // tiles: Array(25).fill(null).map((_, index) => {
  //   const baseTile = {
  //     id: index,
  //     type: index === 12 ? 'storm' : 'normal', // Center tile (index 12) is the storm
  //     sandLevel: 0,
  //     excavated: false,
  //   };

  //   const indicesToModify = [2, 6, 8, 10, 14, 16, 18, 22];
  //   const sandLevelToSet = 1; // You can adjust this value as needed

  //   if (indicesToModify.includes(index)) {
  //     return { ...baseTile, sandLevel: sandLevelToSet };
  //   }

  //   // Add desertID only to normal tiles
  //   if (baseTile.type === 'normal') {
  //     baseTile.desertID = Math.floor(Math.random() * 24) + 1;
  //   }

  //   return baseTile;
  // }),
  // tiles: Array(25).fill(null).map((_, index) => ({
  //   id: index,
  //   type: index === 12 ? 'storm' : 'normal', // Center tile (index 12) is the storm
  //   sandLevel: 0,
  //   excavated: false,
  // })),
  players: [
    { id: 0, type: 'explorer', water: 4, maxWater: 4, position: 0 },
    { id: 1, type: 'waterCarrier', water: 7, maxWater: 7, position: 1 },
    { id: 2, type: 'climber', water: 4, maxWater: 4, position: 6 },
    { id: 3, type: 'archeologist', water: 5, maxWater: 5, position: 8 },
    { id: 4, type: 'meteorologist', water: 4, maxWater: 4, position: 4 },
    { id: 5, type: 'navigator', water: 4, maxWater: 4, position: 7 },
    // Add more players as needed
  ],
  stormLevel: 0,
  sandPile: 48,
  currentPlayer: 0,
  // ... other state properties remain the same
  stormPosition: 12, // We can keep this for easier tracking
  stormDeck: shuffleArray([...stormCardsData.stormCards]), // coming from the JSON
  stormDiscard: [],
};

// const initialState = {
//   tiles: Array(24).fill(null).map((_, index) => ({
//     id: index,
//     type: 'normal', // Can be 'normal', 'clue', 'gear', 'water', 'storm'
//     sandLevel: 0,

//   })),
//   players: [
//     { id: 0, type: 'explorer', water: 4, maxWater: 5, position: 0 },
//     { id: 1, type: 'waterCarrier', water: 5, maxWater: 7, position: 1 },
//     // Add more players as needed
//   ],
//   stormLevel: 0,
//   sandPile: 48,
//   currentPlayer: 0,
//   stormPosition: 12, // Center of the 5x5 grid
//   stormDeck: [], // You'll need to initialize this with actual storm cards
//   stormDiscard: [],
// };

function gameStateReducer(state, action) {
  switch (action.type) {
    case 'MOVE_TILE':
      return moveTile(state, action.payload);
    case 'MOVE_PLAYER':
      return movePlayer(state, action.payload);
    case 'ADJUST_WATER':
      return adjustWater(state, action.payload);
    case 'DRAW_STORM_CARD':
      return drawStormCard(state);
    case 'ADJUST_SAND':
      return adjustSand(state, action.payload);
    case 'EXCAVATE_TILE':
      return excavateTile(state, action.payload);
    case 'MOVE_STORM':
      return moveStorm(state, action.payload);
    default:
      return state;
  }
}

                                   //
// function moveTile(state, { from, to }) {
//   const newTiles = [...state.tiles];
//   [newTiles[from], newTiles[to]] = [newTiles[to], newTiles[from]];
//   return { ...state, tiles: newTiles };
// }
function moveTile(state, { from, to }) {
  // console.log('Moving tile from', from, 'to', to);
  // Don't allow moving the storm tile
  if (state.tiles[from].type === 'storm' || state.tiles[to].type === 'storm') {
    return state;
  }

  const newTiles = [...state.tiles];
  [newTiles[from], newTiles[to]] = [newTiles[to], newTiles[from]];
  return { ...state, tiles: newTiles };
}

function movePlayer(state, { playerId, newPosition }) {
  const newPlayers = state.players.map(player =>
    player.id === playerId ? { ...player, position: newPosition } : player
  );
  return { ...state, players: newPlayers };
}

function adjustWater(state, { playerId, amount }) {
  const newPlayers = state.players.map(player => {
    if (player.id === playerId) {
      const newWater = Math.max(0, Math.min(player.water + amount, player.maxWater));
      return { ...player, water: newWater };
    }
    return player;
  });
  return { ...state, players: newPlayers };
}

function drawStormCard(state) {
  if (state.stormDeck.length === 0) {
    if (state.stormDiscard.length === 0) {
      // Game over condition - storm has overtaken the desert
      return { ...state, gameOver: true, gameResult: 'loss' };
    }
    // Reshuffle discard pile into deck
    return {
      ...state,
      stormDeck: shuffleArray([...state.stormDiscard]),
      stormDiscard: [],
    };
  }

  const [drawnCard, ...remainingDeck] = state.stormDeck;
  let newState = {
    ...state,
    stormDeck: remainingDeck,
    stormDiscard: [...state.stormDiscard, drawnCard]
  };

 switch (drawnCard.type) {
    case 'storm_moves':
      newState = moveStorm(newState, drawnCard.moves, drawnCard.direction);
      break;
    case 'sun_beats_down':
      newState = sunBeatsDown(newState);
      break;
    case 'storm_picks_up':
      newState = { ...newState, stormLevel: newState.stormLevel + 1 };
      // Check if storm level has reached 6
      if (newState.stormLevel > 6) {
        newState = { ...newState, gameOver: true, gameResult: 'loss' };
      }
      break;
   default:
     break;
  }

  return newState;
}

function adjustSand(state, { tileId, amount }) {
  const newTiles = state.tiles.map(tile =>
    tile.id === tileId ? { ...tile, sandLevel: Math.max(0, tile.sandLevel + amount) } : tile
  );
  const sandRemoved = amount < 0 ? Math.abs(amount) : 0;
  const newSandPile = Math.max(0, state.sandPile - sandRemoved);
  return { ...state, tiles: newTiles, sandPile: newSandPile };
}

function excavateTile(state, { tileId }) {
  const newTiles = state.tiles.map(tile =>
    tile.id === tileId ? { ...tile, excavated: true } : tile
  );
  return { ...state, tiles: newTiles };
}

function moveStorm(state, moves, direction) {
  let newStormPosition = state.stormPosition;
  let newTiles = [...state.tiles];
  let sandAdded = 0;

  for (let i = 0; i < moves; i++) {
    let newPosition = newStormPosition;

    switch (direction) {
      case 'n':
        if (newPosition >= 5) newPosition -= 5; // Only move if not in top row
        break;
      case 'e':
        if (newPosition % 5 !== 4) newPosition += 1; // Only move if not in rightmost column
        break;
      case 's':
        if (newPosition < 20) newPosition += 5; // Only move if not in bottom row
        break;
      case 'w':
        if (newPosition % 5 !== 0) newPosition -= 1; // Only move if not in leftmost column
        break;
      default:
        break;
    }
    if (newPosition !== newStormPosition) {
      // Store the old storm position
      const oldStormPosition = newStormPosition;

      // Swap the tiles
      [newTiles[newStormPosition], newTiles[newPosition]] = [newTiles[newPosition], newTiles[newStormPosition]];

      // Update the storm position
      newStormPosition = newPosition;

      // Add sand to the tile that was previously the storm tile
      newTiles[oldStormPosition] = {
        ...newTiles[oldStormPosition],
        sandLevel: newTiles[oldStormPosition].sandLevel + 1
      };
      sandAdded++;
    } else {
      break;
    }
      // console.log('Before update:', newTiles[newStormPosition]);
      // if (newPosition !== newStormPosition) {
    //   console.log('Updating sand level');
    //   // Add sand to the newStormPosition before swapping
    //   newTiles[newStormPosition] = {
    //     ...newTiles[newStormPosition],
    //     sandLevel: newTiles[newStormPosition].sandLevel + 1
    //   };
    //   sandAdded++;

    //   console.log('After update:', newTiles[newStormPosition]);

    //   // Swap the tiles
    //   [newTiles[newStormPosition], newTiles[newPosition]] = [newTiles[newPosition], newTiles[newStormPosition]];

    //   // Update the storm position
    //   newStormPosition = newPosition;
    //   console.log('After swap:', newTiles[newPosition]);
    //   // if (newPosition !== newStormPosition) {
    //   //   [newTiles[newStormPosition], newTiles[newPosition]] = [newTiles[newPosition], newTiles[newStormPosition]];
    //   //   newStormPosition = newPosition;

    //   //   newTiles = newTiles.map((tile, index) => {
    //   //     if (isAdjacent(index, newStormPosition) && index !== newStormPosition) {
    //   //       sandAdded++;
    //   //       return { ...tile, sandLevel: tile.sandLevel + 1 };
    //   //     }
    //   //     return tile;
    //   //   });
    // } else {
    //   break;
    // }
    // console.log('Final newTiles:', newTiles);
    // if (newPosition !== newStormPosition) {
    //   // Swap the storm tile with the tile in the new position
    //   [newTiles[newStormPosition], newTiles[newPosition]] = [newTiles[newPosition], newTiles[newStormPosition]];
    //   newStormPosition = newPosition;

    //   // Add sand to affected tiles
    //   newTiles = newTiles.map((tile, index) => {
    //     if (isAdjacent(index, newStormPosition) && index !== newStormPosition) {
    //       return { ...tile, sandLevel: tile.sandLevel + 1 };
    //     }
    //     return tile;
    //   });
    // } else {
    //   // Storm couldn't move, break the loop
    //   break;
    // }
  }
return {
    ...state,
    stormPosition: newStormPosition,
    tiles: newTiles,
    sandPile: Math.max(0, state.sandPile - sandAdded)
  };
  // return { ...state, stormPosition: newStormPosition, tiles: newTiles };
}

// function moveStorm(state, moves, direction) {
//   let newStormPosition = state.stormPosition;
//   let newTiles = [...state.tiles];

//   for (let i = 0; i < moves; i++) {
//     let newPosition;

//     switch (direction) {
//       case 'n': newPosition = newStormPosition - 5; break;
//       case 'e': newPosition = newStormPosition + 1; break;
//       case 's': newPosition = newStormPosition + 5; break;
//       case 'w': newPosition = newStormPosition - 1; break;
//     }

//     // Wrap around the board
//     newPosition = (newPosition + 25) % 25;

//     // Swap the storm tile with the tile in the new position
//     [newTiles[newStormPosition], newTiles[newPosition]] = [newTiles[newPosition], newTiles[newStormPosition]];
//     newStormPosition = newPosition;

//     // Add sand to affected tiles
//     newTiles = newTiles.map((tile, index) => {
//       if (isAdjacent(index, newStormPosition) && index !== newStormPosition) {
//         return { ...tile, sandLevel: tile.sandLevel + 1 };
//       }
//       return tile;
//     });
//   }

//   return { ...state, stormPosition: newStormPosition, tiles: newTiles };
// }
// function moveStorm(state, moves) {
//   let newStormPosition = state.stormPosition;
//   let newTiles = [...state.tiles];

//   for (let i = 0; i < moves; i++) {
//     const direction = Math.floor(Math.random() * 4); // 0: up, 1: right, 2: down, 3: left
//     let newPosition;

//     switch (direction) {
//       case 0: newPosition = newStormPosition - 5; break; // up
//       case 1: newPosition = newStormPosition + 1; break; // right
//       case 2: newPosition = newStormPosition + 5; break; // down
//       case 3: newPosition = newStormPosition - 1; break; // left
//     }

//     // Wrap around the board
//     newPosition = (newPosition + 25) % 25;

//     // Move the storm tile
//     newTiles[newStormPosition].type = 'normal';
//     newTiles[newPosition].type = 'storm';
//     newStormPosition = newPosition;

//     // Add sand to affected tiles
//     newTiles = newTiles.map((tile, index) => {
//       if (isAdjacent(index, newStormPosition) && tile.type !== 'storm') {
//         return { ...tile, sandLevel: tile.sandLevel + 1 };
//       }
//       return tile;
//     });
//   }

//   return { ...state, stormPosition: newStormPosition, tiles: newTiles };
// }
// function moveStorm(state, moves) {
//   let newStormPosition = state.stormPosition;
//   let newTiles = [...state.tiles];

//   for (let i = 0; i < moves; i++) {
//     const direction = Math.floor(Math.random() * 4); // 0: up, 1: right, 2: down, 3: left
//     switch (direction) {
//       case 0: newStormPosition -= 5; break; // up
//       case 1: newStormPosition += 1; break; // right
//       case 2: newStormPosition += 5; break; // down
//       case 3: newStormPosition -= 1; break; // left
//     }

//     // Wrap around the board
//     newStormPosition = (newStormPosition + 25) % 25;

//     // Add sand to affected tiles
//     newTiles = newTiles.map(tile => {
//       if (isAdjacent(tile.id, newStormPosition)) {
//         return { ...tile, sandLevel: tile.sandLevel + 1 };
//       }
//       return tile;
//     });
//   }

//   return { ...state, stormPosition: newStormPosition, tiles: newTiles };
// }

function sunBeatsDown(state) {
  const newPlayers = state.players.map(player => ({
    ...player,
    water: Math.max(0, player.water - 1)
  }));
  return { ...state, players: newPlayers };
}

// Utility functions
// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// function isAdjacent(tileId, stormPosition) {
//   const row = Math.floor(tileId / 5);
//   const col = tileId % 5;
//   const stormRow = Math.floor(stormPosition / 5);
//   const stormCol = stormPosition % 5;
//   return Math.abs(row - stormRow) <= 1 && Math.abs(col - stormCol) <= 1;
// }

// ... (rest of the file)

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}

export default GameStateProvider;  // Add this line to export as default
