// src/contexts/GameStateProvider.js
import React, { createContext, useContext, useReducer } from 'react';
import stormCardsData from '../stormCards.json';
import initialEquipment from '../equipmentDeck.json';
import playerInfo from '../playerInfoData.json';
import partInfo from '../partInfoData.json';

const GameStateContext = createContext();
const randomStartPosition = getRandomInt(0, 24);

const initialState = {
  noOfPlayers: 6,
  gameOver: false,
  gameResult: null,
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
  players: playerInfo.map(player => ({
    ...player,
    position: randomStartPosition,
    water: player.maxWater,
  })),
  parts: partInfo,
  stormLevel: 1,
  sandPile: 40,
  currentPlayer: 0,
  // ... other state properties remain the same
  stormPosition: 12, // We can keep this for easier tracking
  stormDeck: shuffleArray([...stormCardsData.stormCards]), // coming from the JSON
  stormDiscard: [],
  lastDrawnCard: null,
  equipmentIds: shuffleArray(initialEquipment.map(eq => eq.id)),
  equipment: initialEquipment,
  assignedEquipmentCount: 0,
  peekedTileIds: [],
  terrascopeInUse: null,
};


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
    case 'PEEK_TILE':
      return peekTile(state, action.payload);
    case 'PLACE_PART':
      return placePart(state, action.payload);
    case 'PICK_UP_PART':
      return pickUpPart(state, action.payload)
    case 'MOVE_STORM':
      return moveStorm(state, action.payload);
    case 'ASSIGN_EQUIPMENT':
      return handleAssignEquipment(state, action.payload);
    case 'USE_EQUIPMENT':
      return handleUseEquipment(state, action.payload);
    default:
      return state;
  }
}

function moveTile(state, { from, to }) {
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
    if (state.sandPile === 0) {
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
    stormDiscard: [...state.stormDiscard, drawnCard],
    lastDrawnCard: drawnCard,
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
  const newSandPile = Math.max(0, state.sandPile + sandRemoved);
  return { ...state, tiles: newTiles, sandPile: newSandPile };
}

function excavateTile(state, { tileId, treasure }) {
  const newTiles = state.tiles.map(tile =>
    tile.id === tileId ? { ...tile, excavated: true } : tile
  );

  let updatedParts = state.parts;
  if (treasure.type === 'gear' || treasure.type === 'tunnel') {
    if (state.assignedEquipmentCount < state.equipmentIds.length) {
      return {
        ...state,
        tiles: newTiles,
        assignedEquipmentCount: state.assignedEquipmentCount + 1,
      };
    }
  } else if (treasure.type === 'clue') {
    updatedParts = state.parts.map(part => {
      if (treasure.direction === 'horizontal' && treasure.part === part.type) {
        return { ...part, horizontalClue: true };
      } else if (treasure.direction === 'vertical' && treasure.part === part.type) {
        return { ...part, verticalClue: true };
      }
      return part;
    });
  }

  return { ...state, tiles: newTiles, parts: updatedParts };
}

function peekTile(state, {tileId, terraScopeIndex}) {
  const updatedPeekedTileIds = [...state.peekedTileIds];
  console.log(updatedPeekedTileIds);
  updatedPeekedTileIds[terraScopeIndex] = tileId;
  console.log(updatedPeekedTileIds);
  return {
    ...state,
    peekedTileIds: updatedPeekedTileIds,
    equipment: state.equipment.map(eq =>
      eq.id === state.terrascopeInUse ? { ...eq, used: true } : eq
    ),
    terrascopeInUse: null,
  };
}

function placePart(state, { partId, tileId }) {
  const placedParts = state.parts.map(part => {
    if (part.id === partId) {
      return { ...part, tileId, placed: true };
    }
    return part;
  });
  return { ...state, parts: placedParts };
}

function pickUpPart(state, { partId }) {
  const pickedUpParts = state.parts.map(part => {
    if (part.id === partId) {
      return { ...part, tileId: null, pickedUp: true };
    }
    return part;
  });
  return { ...state, parts: pickedUpParts };
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
  }
return {
    ...state,
    stormPosition: newStormPosition,
    tiles: newTiles,
    sandPile: Math.max(0, state.sandPile - sandAdded)
  };
  // return { ...state, stormPosition: newStormPosition, tiles: newTiles };
}


function sunBeatsDown(state) {
  const newPlayers = state.players.map(player => ({
    ...player,
    water: Math.max(0, player.water - 1)
  }));
  return { ...state, players: newPlayers };
}

function handleAssignEquipment(state, { equipmentId, playerId }) {
  return {
        ...state,
        equipment: state.equipment.map(eq =>
          eq.id === equipmentId ? { ...eq, playerId, used: false } : eq
        )
      };
}

function handleUseEquipment(state, { equipmentId }) {
  const equipment = state.equipment.find(eq => eq.id === equipmentId);

  if (equipment.type === 'Terrascope') {
    return {
      ...state,
      peekedTileIds: [...state.peekedTileIds, null],
      terrascopeInUse: equipmentId,
    };
  }

  return {
        ...state,
        equipment: state.equipment.map(eq =>
          eq.id === equipmentId ? { ...eq, used: true } : eq
        )
      };
}

// Utility functions

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function getRandomInt(min, max) {
  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (randomNumber === 12); // since storm starts at position 12
  return randomNumber;
}

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
