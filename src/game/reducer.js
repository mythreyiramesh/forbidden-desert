// src/game/reducer.js
import { shuffleArray, getCardsToDraw } from './rules';

export function gameStateReducer(state, action) {
  // Prevent setup changes if the game is frozen
  if ((state.isFrozen && state.gameStarted) && ['SET_PLAYER_COUNT', 'SET_STORM_LEVEL', 'SET_ORDERED_PLAYER_INDICES',
                        'ADD_ORDERED_PLAYER_INDEX', 'REMOVE_ORDERED_PLAYER_INDEX', 'SET_TILE_POSITIONS'].includes(action.type)) {
    return state;
  }

  // Once the game has ended, nothing else may change the outcome
  if (state.gameOver) {
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
    case 'CANCEL_TERRASCOPE':
      return cancelTerrascope(state);
    case 'PLACE_PART':
      return placePart(state, action.payload);
    case 'PICK_UP_PART':
      return pickUpPart(state, action.payload)
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
    case 'NEXT_TURN':
      return resetTurnParameters(state);
    case 'FREEZE_GAME_SETUP':
      return freezeGameSetup(state);
    case 'UNFREEZE_GAME_SETUP':
      return unfreezeGameSetup(state);
    case 'START_GAME':
      return startGame(state);
    default:
      return state;
  }
}

function freezeGameSetup(state) {
  if (state.orderedPlayerIndices.length === state.noOfPlayers) {
    return {
      ...state,
      isFrozen: true,
    };
  }
  return state; // Don't freeze if not enough players
}

function unfreezeGameSetup(state) {
        return {
        ...state,
        isFrozen: false,
      };

}

function startGame(state) {
  if (state.isFrozen && !state.gameStarted) {
    return {
      ...state,
      gameStarted: true,
      currentPlayer: 0,
      cardsDrawnInTurn: 0,
    };
  }
  return state;

}

function resetTurnParameters(state) {
  return {
    ...state,
    currentPlayer: (state.currentPlayer + 1) % state.noOfPlayers,
    cardsDrawnInTurn: 0,
  };

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
  return {
    ...state,
    crashTilePosition: crashID,
    tunnelTilePositions: tunnelIDs,
  };
}

function movePlayer(state, { playerId, newPosition }) {
  const mover = state.players.find(player => player.id === playerId);
  if (!mover) return state;
  let moved = updateShield(state, { playerId, oldPosition: mover.position, newPosition });
  const newPlayers = moved.players.map(player =>
    player.id === playerId ? { ...player, position: newPosition } : player
  );
  moved = { ...moved, players: newPlayers };
  return checkWinCondition(moved);
}

function adjustWater(state, { playerId, amount }) {
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
  if (anyoneThirsty) {
    return { ...state, players: newPlayers, gameOver: true, gameResult: 'loss' };
  }
  return { ...state, players: newPlayers };
}

function drawStormCard(state) {
  if (state.stormDeck.length === 0) {
    if (state.stormDiscard.length === 0) return state;
    // Reshuffle discard pile into deck, then draw from it
    return drawStormCard({
      ...state,
      stormDeck: shuffleArray([...state.stormDiscard]),
      stormDiscard: [],
    });
  }

  const [drawnCard, ...remainingDeck] = state.stormDeck;
  let newState = {
    ...state,
    stormDeck: remainingDeck,
    stormDiscard: [...state.stormDiscard, drawnCard],
    lastDrawnCard: drawnCard,
    cardsDrawnInTurn: state.cardsDrawnInTurn + 1,
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
  if ((state.sandPile - sandAdded) < 0) {
    // Game over: a sand marker was needed but the supply is empty
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
  const cardsToReveal = state.stormDeck.slice(0, noOfCards);
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
  return {
        ...state,
        stormDeck: [...state.revealedCards, ...state.stormDeck],
        revealedCards: []
      };
}


function adjustSand(state, { tileId, amount }) {
  const target = state.tiles.find(tile => tile.id === tileId);
  if (!target || (amount < 0 && target.sandLevel === 0)) return state;
  const newTiles = state.tiles.map(tile =>
    tile.id === tileId ? { ...tile, sandLevel: Math.max(0, tile.sandLevel + amount) } : tile
  );
  const sandRemoved = amount < 0 ? Math.abs(amount) : 0;
  const newSandPile = Math.max(0, state.sandPile + sandRemoved);
  return { ...state, tiles: newTiles, sandPile: newSandPile };
}

function excavateTile(state, { tileId, treasure }) {
  const target = state.tiles.find(tile => tile.id === tileId);
  if (!target || target.excavated || !treasure) return state;

  const newTiles = state.tiles.map(tile =>
    tile.id === tileId ? { ...tile, excavated: true } : tile
  );
  let next = { ...state, tiles: newTiles };

  if (treasure.type === 'tunnel') {
    next.excavatedTunnelTiles = [...state.excavatedTunnelTiles, tileId];
  }
  if ((treasure.type === 'gear' || treasure.type === 'tunnel') &&
      state.assignedEquipmentCount < state.equipmentIds.length) {
    next.assignedEquipmentCount = state.assignedEquipmentCount + 1;
  } else if (treasure.type === 'clue') {
    next.parts = state.parts.map(part => {
      if (treasure.part !== part.type) return part;
      if (treasure.direction === 'horizontal') return { ...part, horizontalClue: true };
      if (treasure.direction === 'vertical') return { ...part, verticalClue: true };
      return part;
    });
  }
  return next;
}

function peekTile(state, {tileId, terraScopeIndex}) {
  const updatedPeekedTileIds = [...state.peekedTileIds];
  updatedPeekedTileIds[terraScopeIndex] = tileId;
  return {
    ...state,
    peekedTileIds: updatedPeekedTileIds,
    equipment: state.equipment.map(eq =>
      eq.id === state.terrascopeInUse ? { ...eq, used: true } : eq
    ),
    terrascopeInUse: null,
  };
}

function cancelTerrascope(state) {
  if (!state.terrascopeInUse) return state;
  const idx = state.peekedTileIds.lastIndexOf(null);
  return {
    ...state,
    peekedTileIds: idx === -1 ? state.peekedTileIds : state.peekedTileIds.filter((_, i) => i !== idx),
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
  return checkWinCondition({ ...state, parts: pickedUpParts });
}


function handleAssignEquipment(state, { equipmentId, playerId }) {
  return {
        ...state,
        equipment: state.equipment.map(eq =>
          eq.id === equipmentId && !eq.active
            ? { ...eq, playerId: playerId === '' || playerId == null ? null : Number(playerId), used: false }
            : eq
        )
      };
}

function handleUseEquipment(state, { equipmentId }) {
  const equipment = state.equipment.find(eq => eq.id === equipmentId);
  if (!equipment) return state;

  if (equipment.type === 'Terrascope') {
    return {
      ...state,
      peekedTileIds: [...state.peekedTileIds, null],
      terrascopeInUse: equipmentId,
    };
  } else if (equipment.type === 'Solar Shield') {
    const eqPlayer = equipment.playerId == null
      ? null
      : state.players.find(player => player.id === Number(equipment.playerId));
    if (!eqPlayer) return state;
    const activeTile = eqPlayer.position;
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
  const solarShieldWithPlayer = state.equipment.filter(
    (eq) => eq.playerId != null && Number(eq.playerId) === playerId && eq.type === 'Solar Shield' && eq.active
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

function makeTileUnshielded(state, { equipmentId }) {
  const equipment = state.equipment.find(eq => eq.id === equipmentId);
  const playerWithThisEquipment = equipment && equipment.playerId != null
    ? state.players.find(player => Number(equipment.playerId) === player.id)
    : null;
  if (!playerWithThisEquipment) return state;
  // Create a new solarShieldTiles array without the player's position
  const newSolarShieldTiles = state.solarShieldTiles.filter(
    (tile) => tile !== playerWithThisEquipment.position
  );
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
