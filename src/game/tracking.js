// src/game/tracking.js
// Turn bookkeeping that sits on top of the game reducer: it counts the current player's
// actions, adds Time Throttler's extra actions and writes the action log.
// It only observes (previous state, action, next state); the handlers know nothing about it.

export const ACTIONS_PER_TURN = 4;
export const MAX_LOG_ENTRIES = 200;

const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function currentPlayer(state) {
  if (state.currentPlayer == null) return null;
  return state.players[state.orderedPlayerIndices[state.currentPlayer]] ?? null;
}

const playerName = (state, id) => state.players.find((p) => p.id === id)?.name ?? 'A player';
const positionOf = (state, id) => state.players.find((p) => p.id === id)?.position;

// Tiles swap places when the storm moves, so a tile's place is its index in `tiles`, not its id.
function where(state, tileId) {
  const index = state.tiles.findIndex((t) => t.id === tileId);
  return index === -1 ? 'a tile' : `row ${Math.floor(index / 5) + 1}, column ${(index % 5) + 1}`;
}

const equipmentOf = (state, id) => state.equipment.find((e) => e.id === id);
const partName = (state, id) => capitalise(state.parts.find((p) => p.id === id)?.type ?? 'part');

// How many actions this step cost (negative) or gave (positive) the player whose turn it is.
function actionDelta(prev, action, next) {
  const current = currentPlayer(prev);
  if (!current) return 0;
  const { payload } = action;
  switch (action.type) {
    case 'MOVE_PLAYER':
      return payload.playerId === current.id && positionOf(prev, current.id) !== positionOf(next, current.id) ? -1 : 0;
    case 'ADJUST_SAND':
      return payload.amount < 0 && next.sandPile > prev.sandPile ? -1 : 0;
    case 'EXCAVATE_TILE': {
      const was = prev.tiles.find((t) => t.id === payload.tileId);
      const now = next.tiles.find((t) => t.id === payload.tileId);
      return was && now && !was.excavated && now.excavated ? -1 : 0;
    }
    case 'PICK_UP_PART': {
      const was = prev.parts.find((p) => p.id === payload.partId);
      const now = next.parts.find((p) => p.id === payload.partId);
      return was && now && !was.pickedUp && now.pickedUp ? -1 : 0;
    }
    case 'USE_EQUIPMENT': {
      const was = equipmentOf(prev, payload.equipmentId);
      const now = equipmentOf(next, payload.equipmentId);
      return was?.type === 'Time Throttler' && now?.used && !was.used ? 2 : 0;
    }
    default:
      return 0;
  }
}

function describeDraw(prev, next) {
  const card = next.lastDrawnCard;
  const parts = [];
  if (prev.stormDeck.length === 0) parts.push('Reshuffled the discard pile.');
  parts.push(`Drew: ${card.description}.`);
  if (card.type === 'storm_moves') {
    const added = prev.sandPile - next.sandPile;
    parts.push(added > 0 ? `${plural(added, 'sand marker')} added.` : 'The storm could not move.');
  } else if (card.type === 'sun_beats_down') {
    const inGame = prev.orderedPlayerIndices.map((i) => next.players[i]);
    const thirsty = inGame.filter((p) => p.water < (prev.players.find((q) => q.id === p.id)?.water ?? p.water));
    // The card text already says everyone loses water, so only say who was spared or who was hit.
    if (thirsty.length === 0) parts.push('Nobody lost water.');
    else if (thirsty.length < inGame.length) parts.push(`Lost water: ${thirsty.map((p) => p.name).join(', ')}.`);
  } else if (card.type === 'storm_picks_up') {
    parts.push(`Storm level is now ${next.stormLevel}, draw ${next.cardsToDraw}.`);
  }
  return parts.join(' ');
}

function describe(prev, action, next) {
  const { payload } = action;
  switch (action.type) {
    case 'START_GAME':
      return 'The game started.';
    case 'NEXT_TURN':
      return `${currentPlayer(next)?.name ?? 'Next player'} is up.`;
    case 'DRAW_STORM_CARD':
      return next.lastDrawnCard ? describeDraw(prev, next) : null;
    case 'REVEAL_STORM_CARDS':
      return `Revealed ${plural(next.revealedCards.length, 'storm card')}.`;
    case 'MOVE_CARD_TO_BOTTOM':
      return 'Moved a revealed card to the bottom of the deck.';
    case 'ADJUST_WATER': {
      const was = prev.players.find((p) => p.id === payload.playerId);
      const now = next.players.find((p) => p.id === payload.playerId);
      if (!was || !now || was.water === now.water) return null;
      return `${now.name} ${now.water > was.water ? 'gained' : 'lost'} water (${now.water} of ${now.maxWater}).`;
    }
    case 'ADJUST_SAND':
      return `${payload.amount < 0 ? 'Removed' : 'Added'} sand at ${where(next, payload.tileId)}.`;
    case 'EXCAVATE_TILE':
      return `Excavated ${payload.treasure?.name ?? 'a tile'} at ${where(next, payload.tileId)}.`;
    case 'MOVE_PLAYER':
      return `${playerName(next, payload.playerId)} moved to ${where(next, payload.newPosition)}.`;
    case 'PEEK_TILE':
      return `Peeked at ${where(next, payload.tileId)} with the Terrascope.`;
    case 'PLACE_PART':
      return `${partName(next, payload.partId)} placed at ${where(next, payload.tileId)}.`;
    case 'PICK_UP_PART':
      return `${partName(next, payload.partId)} picked up.`;
    case 'ASSIGN_EQUIPMENT': {
      const eq = equipmentOf(next, payload.equipmentId);
      return eq?.playerId == null
        ? `${eq?.type ?? 'Equipment'} is unassigned.`
        : `${eq.type} given to ${playerName(next, eq.playerId)}.`;
    }
    case 'USE_EQUIPMENT': {
      const eq = equipmentOf(prev, payload.equipmentId);
      if (!eq) return null;
      const who = eq.playerId == null ? 'Someone' : playerName(prev, eq.playerId);
      return `${who} used ${eq.type}${eq.type === 'Time Throttler' ? ' (2 extra actions)' : ''}.`;
    }
    case 'DEACTIVATE_SHIELD':
      return 'A Solar Shield was turned off.';
    case 'ADJUST_ACTIONS':
      return `Actions left set to ${next.actionsLeft}.`;
    case 'ADJUST_STORM_LEVEL':
      return `Storm level set to ${next.stormLevel}, draw ${next.cardsToDraw}.`;
    case 'ADJUST_SAND_PILE':
      return `Sand pile set to ${next.sandPile}.`;
    case 'RESTORE_EQUIPMENT':
      return `${equipmentOf(next, payload.equipmentId)?.type ?? 'Equipment'} restored.`;
    default:
      return null;
  }
}

export function trackAction(prev, action, next) {
  if (next === prev) return next;

  const delta = prev.gameStarted ? actionDelta(prev, action, next) : 0;
  const state = delta ? { ...next, actionsLeft: next.actionsLeft + delta } : next;

  const texts = [];
  const text = (prev.gameStarted || action.type === 'START_GAME') ? describe(prev, action, next) : null;
  if (text) texts.push(text);
  if (!prev.gameOver && state.gameOver && text) {
    texts.push(state.gameResult === 'win' ? 'You won.' : 'Game over: you lost.');
  }
  if (texts.length === 0) return state;

  const lastId = state.log.length ? state.log[state.log.length - 1].id : 0;
  const who = currentPlayer(state)?.name ?? '';
  const entries = texts.map((t, i) => ({ id: lastId + i + 1, turn: state.turnNumber, player: who, text: t }));
  return { ...state, log: [...state.log, ...entries].slice(-MAX_LOG_ENTRIES) };
}
