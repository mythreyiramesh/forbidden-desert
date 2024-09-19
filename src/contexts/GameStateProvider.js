// src/contexts/GameStateProvider.js
import React, { createContext, useContext, useReducer } from 'react';
import stormCardsData from '../stormCards.json';
import initialEquipment from '../equipmentDeck.json';
import playerInfo from '../playerInfoData.json';
import partInfo from '../partInfoData.json';

const GameStateContext = createContext();
const randomStartPosition = getRandomInt(0, 24);
const decidedNoOfPlayers = 6;

const initialState = {
  isFrozen: false,
  gameStarted: false,
  noOfPlayers: decidedNoOfPlayers,
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
  crashTilePosition: null,
  tunnelTilePositions: [],
  excavatedTunnelTiles: [],
  players: playerInfo.map(player => ({
    ...player,
    position: randomStartPosition,
    water: player.maxWater,
  })),
  orderedPlayerIndices: [],
  parts: partInfo,
  stormLevel: 1,
  cardsToDraw: getCardsToDraw(1,decidedNoOfPlayers),
  sandPile: 40,
  currentPlayer: 0,
  // ... other state properties remain the same
  stormPosition: 12, // We can keep this for easier tracking
  stormDeck: shuffleArray([...stormCardsData.stormCards]), // coming from the JSON
  stormDiscard: [],
  lastDrawnCard: null,
  revealedCards: [],
  equipmentIds: shuffleArray(initialEquipment.map(eq => eq.id)),
  equipment: initialEquipment,
  assignedEquipmentCount: 0,
  peekedTileIds: [],
  terrascopeInUse: null,
  solarShieldActive: false,
  solarShieldTiles: [],
};


function gameStateReducer(state, action) {
  // Prevent setup changes if the game is frozen
  if ((state.isFrozen && state.gameStarted) && ['SET_PLAYER_COUNT', 'SET_STORM_LEVEL', 'SET_ORDERED_PLAYER_INDICES',
                        'ADD_ORDERED_PLAYER_INDEX', 'REMOVE_ORDERED_PLAYER_INDEX', 'SET_TILE_POSITIONS'].includes(action.type)) {
    return state;
  }

  switch (action.type) {
    case 'SET_PLAYER_COUNT':
      return setPlayerCount(state, action.payload);
    case 'SET_STORM_LEVEL':
      return setStormLevel(state, action.payload);
    case 'SET_ORDERED_PLAYER_INDICES':
      return setOrderedPlayerIndices(state, action.payload);
    case 'ADD_ORDERED_PLAYER_INDEX':
      return addOrderedPlayerIndex(state, action.payload);
    case 'REMOVE_ORDERED_PLAYER_INDEX':
      return removeOrderedPlayerIndex(state, action.payload);
    case 'SET_TILE_POSITIONS':
      return setTilePositions(state, action.payload);
    case 'MOVE_TILE':
      return moveTile(state, action.payload);
    case 'MOVE_PLAYER':
      return movePlayer(state, action.payload);
    case 'ADJUST_WATER':
      return adjustWater(state, action.payload);
    case 'DRAW_STORM_CARD':
      return drawStormCard(state);
    case 'REVEAL_STORM_CARDS':
      return revealStormCards(state, action.payload);
    case 'MOVE_CARD_TO_BOTTOM':
      return moveCardToBottom(state, action.payload);
    case 'FINISH_REVEALING':
      return finishRevealing(state);
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
    case 'UPDATE_SHIELD':
      return updateShield(state, action.payload);
    case 'MAKE_TILE_UNSHIELDED':
      return makeTileUnshielded(state, action.payload);
    case 'DEACTIVATE_SHIELD':
      return deactivateShield(state, action.payload);
    case 'CHECK_WIN_CONDITION':
      return checkWinCondition(state);
    case 'FREEZE_GAME_SETUP':
      if (state.orderedPlayerIndices.length === state.noOfPlayers) {
        return {
          ...state,
          isFrozen: true,
        };
      }
      return state; // Don't freeze if not enough players
    case 'UNFREEZE_GAME_SETUP':
      return {
        ...state,
        isFrozen: false,
      };
    case 'START_GAME':
      if (state.isFrozen && !state.gameStarted) {
        return {
          ...state,
          gameStarted: true,
        };
      }
      return state;
    default:
      return state;
  }
}

function setPlayerCount(state, {count}) {
  return {
    ...state,
    noOfPlayers: count,
    orderedPlayerIndices: state.orderedPlayerIndices.slice(0, count),
  };
}

function setStormLevel(state, {level, count}) {
  return {
    ...state,
    stormLevel: level,
    cardsToDraw: getCardsToDraw(level,count),
  };
}

function setOrderedPlayerIndices(state, {newOrder}) {
  return {
    ...state,
    orderedPlayerIndices: newOrder,
  };
}

function addOrderedPlayerIndex(state, {newIndex}) {
  return {
    ...state,
    orderedPlayerIndices: [...state.orderedPlayerIndices, newIndex],
  };
}

function removeOrderedPlayerIndex(state, {newIndex}) {
  return {
    ...state,
    orderedPlayerIndices: state.orderedPlayerIndices.filter(index => index !== newIndex),
  };
}

function setTilePositions(state, {crashID, tunnelIDs}) {
  // console.log("crashID",crashID);
  return {
    ...state,
    crashTilePosition: crashID,
    tunnelTilePositions: tunnelIDs,
  };
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
  // console.log(state.players);
  const newPlayers = state.players.map(player => {
    if (player.id === playerId) {
      const newWater = Math.max(0, Math.min(player.water + amount, player.maxWater));
      return { ...player, water: newWater };
    }
    return player;
  });
  const anyoneThirsty = state.orderedPlayerIndices
                             .map(index => newPlayers[index])
                             .some((player) => player.water === 0);
  // console.log(anyoneThirsty);
  // console.log(newPlayers);
  return { ...state, players: newPlayers, gameOver: anyoneThirsty ? true : false, gameResult: anyoneThirsty ? 'loss' : null };
}

function drawStormCard(state) {
  // console.log("Crash",state.crashTilePosition);
  if (state.stormDeck.length === 0) {
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
      newState = { ...newState, cardsToDraw: getCardsToDraw(newState.stormLevel, newState.noOfPlayers) };

      // Check if storm level has reached 6
      if (newState.cardsToDraw > 6) {
        newState = { ...newState, gameOver: true, gameResult: 'loss' };
      }
      break;
   default:
     break;
  }
  // console.log(drawnCard);
  // console.log(remainingDeck);
  return newState;
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
  if ((state.sandPile - sandAdded) <= 0) {
    // Game over condition - storm has overtaken the desert
    return { ...state,
             gameOver: true,
             gameResult: 'loss',
             stormPosition: newStormPosition,
             tiles: newTiles,
             sandPile: Math.max(0, state.sandPile - sandAdded)
           };
  } else {
    return {
      ...state,
      stormPosition: newStormPosition,
      tiles: newTiles,
      sandPile: Math.max(0, state.sandPile - sandAdded)
    };
  }
}

function sunBeatsDown(state) {
  const playersOutsideTunnels = state.players
                              .filter((player, index) => state.orderedPlayerIndices.includes(index))
                              .filter(player => !state.excavatedTunnelTiles.includes(player.position))
                              .map(player => player.id);
  const playersOutsideShields = state.players
                              .filter((player, index) => state.orderedPlayerIndices.includes(index))
                              .filter(player => !state.solarShieldTiles.includes(player.position))
                              .map(player => player.id);
  const playersOutsideOfBothTunnelsAndShields = playersOutsideTunnels.filter(
    playerId => playersOutsideShields.includes(playerId)
  );
  return playersOutsideOfBothTunnelsAndShields.reduce((updatedState, playerId) => {
    return adjustWater(updatedState, { playerId, amount: -1 });
  }, state);
}

function revealStormCards(state, {noOfCards}){
  // console.log(noOfCards);
  const cardsToReveal = state.stormDeck.slice(0, noOfCards);
  // console.log(cardsToReveal.length);
  return {
    ...state,
    revealedCards: cardsToReveal,
    stormDeck: state.stormDeck.slice(noOfCards)
  };
}

function moveCardToBottom(state, {indexToMove}) {
  const cardToMove = state.revealedCards[indexToMove];
  const updatedRevealedCards = state.revealedCards.filter((_, index) => index !== indexToMove);
  return {
    ...state,
    stormDeck: [...state.stormDeck, cardToMove],
    revealedCards: updatedRevealedCards
  };
}

function finishRevealing(state) {
  console.log([...state.revealedCards, ...state.stormDeck]);
  return {
        ...state,
        stormDeck: [...state.revealedCards, ...state.stormDeck],
        revealedCards: []
      };
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
  // console.log("Excavating",tileId);
  // console.log(state.tunnelTilePositions, state.excavatedTunnelTiles);
  const newTiles = state.tiles.map(tile =>
    tile.id === tileId ? { ...tile, excavated: true } : tile
  );
  let updatedParts = state.parts;
  let updatedExcavatedTunnelTiles = state.excavatedTunnelTiles;
  if (treasure.type === 'gear' || treasure.type === 'tunnel') {
    if (state.assignedEquipmentCount < state.equipmentIds.length) {
      if (treasure.type === 'tunnel') {
        updatedExcavatedTunnelTiles = [...state.excavatedTunnelTiles, tileId];
      }
      return {
        ...state,
        tiles: newTiles,
        assignedEquipmentCount: state.assignedEquipmentCount + 1,
        excavatedTunnelTiles: updatedExcavatedTunnelTiles,
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
  return {
    ...state,
    tiles: newTiles,
    parts: updatedParts,
    excavatedTunnelTiles: updatedExcavatedTunnelTiles,
  };
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
  } else if (equipment.type === 'Solar Shield') {
    const eqPlayer = state.players.find(player => player.id === +equipment.playerId);
    console.log("Eq player",eqPlayer);
    console.log("global state",state.solarShieldTiles);
    const activeTile = eqPlayer.position;
    console.log("activetile",activeTile);
    return {
      ...state,
      solarShieldActive: true,
      solarShieldTiles: [...state.solarShieldTiles, activeTile],
      equipment: state.equipment.map(eq =>
        eq.id === equipmentId ? { ...eq, active: true } : eq
      )
    };
  }
  return {
    ...state,
    equipment: state.equipment.map(eq =>
      eq.id === equipmentId ? { ...eq, used: true } : eq
    )
  };
}

function updateShield(state, { playerId, oldPosition, newPosition }) {
  console.log("global state now",state.solarShieldTiles);
  const solarShieldWithPlayer = state.equipment.filter(
    (eq) => Number(eq.playerId) === playerId && eq.type === 'Solar Shield' && eq.active
  );

  if (solarShieldWithPlayer.length > 0) {
    const newSolarShieldTiles = state.solarShieldTiles.map((tile) =>
      tile === oldPosition ? newPosition : tile
    );

    return {
      ...state,
      solarShieldTiles: newSolarShieldTiles,
    };
  }

  return state;
}

// function updateShield(state, { playerId, oldPosition, newPosition }) {
//   console.log("global state now",state.solarShieldTiles);
//   const solarShieldWithPlayer = state.equipment.filter(eq => Number(eq.playerId) === playerId)
//                                      .filter(eq => eq.type === 'Solar Shield')
//                                      .filter(eq => eq.active);
//   console.log("oldShield",state.solarShieldTiles);
//   const newShieldTiles = state.solarShieldTiles;
//   if (solarShieldWithPlayer.length > 0) {
//     // Check if the oldPosition is already in the newShieldTiles array
//     const oldPositionIndex = newShieldTiles.indexOf(oldPosition);
//     if (oldPositionIndex !== -1) {
//     // Replace the old position with the new position
// return [
//       ...newShieldTiles.slice(0, oldPositionIndex),
//       newPosition,
//       ...newShieldTiles.slice(oldPositionIndex + 1)
//     ];
//   } else {
//     // Add the new position to the newShieldTiles array
//     return [...tiles, newPosition];
//   }
//   }
//   console.log("newShield",newShieldTiles);
//   return {
//     ...state,
//   };
// }

function makeTileUnshielded(state, { equipmentId }) {
  const equipment = state.equipment.find(eq => eq.id === equipmentId);
  const playerWithThisEquipment = state.players.find(
    (player) => Number(equipment.playerId) === player.id );
  console.log("Player with this Equipment",playerWithThisEquipment);
  // Create a new solarShieldTiles array without the player's position
  const newSolarShieldTiles = state.solarShieldTiles.filter(
    (tile) => tile !== playerWithThisEquipment.position
  );
  console.log("New Tile List",newSolarShieldTiles);
  console.log("player's current position",playerWithThisEquipment.position);
  return {
    ...state,
    solarShieldTiles: newSolarShieldTiles,
  };
}

function deactivateShield(state, { equipmentId }) {
  return {
    ...state,
    equipment: state.equipment.map(eq =>
      eq.id === equipmentId ? { ...eq, active: false, used: true } : eq
    ),
    solarShieldActive: state.solarShieldTiles.length >= 1 ? true : false,
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

function getCardsToDraw(stormLevel, noOfPlayers) {
  if (noOfPlayers <= 2) {
    if (stormLevel >= 14) return 7;
    if (stormLevel >= 12) return 6;
    if (stormLevel >= 9) return 5;
    if (stormLevel >= 5) return 4;
    if (stormLevel >= 2) return 3;
    return 2;
  } else if (noOfPlayers === 3) {
    if (stormLevel >= 15) return 7;
    if (stormLevel >= 13) return 6;
    if (stormLevel >= 10) return 5;
    if (stormLevel >= 6) return 4;
    if (stormLevel >= 2) return 3;
    return 2;
  } else if (noOfPlayers === 4) {
    if (stormLevel >= 15) return 7;
    if (stormLevel >= 13) return 6;
    if (stormLevel >= 10) return 5;
    if (stormLevel >= 6) return 4;
    if (stormLevel >= 2) return 3;
    return 2;
  } else {
    if (stormLevel >= 16) return 7;
    if (stormLevel >= 14) return 6;
    if (stormLevel >= 11) return 5;
    if (stormLevel >= 7) return 4;
    if (stormLevel >= 2) return 3;
    return 2;
  }
}

function checkWinCondition (state) {
  const { players, orderedPlayerIndices, crashTilePosition } = state;
  const allPlayersOnCrashTile = orderedPlayerIndices.length > 0 &&
        orderedPlayerIndices.every(index =>
          players[index].position === crashTilePosition
        );
  const allPartsCollected = state.parts.every(part => part.pickedUp);

  if (allPartsCollected && allPlayersOnCrashTile) {
    return  {
      ...state,
      gameOver: true,
      gameResult: 'win'
    };
  }

  return state;
};

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
