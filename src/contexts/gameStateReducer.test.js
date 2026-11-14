import { gameStateReducer } from '../game/reducer';
import { createInitialState } from '../game/createInitialState';
import { getCardsToDraw } from '../game/rules';
import { sessionReducer } from './GameStateProvider';

const initialState = createInitialState();

const started = () => ({
  ...initialState,
  gameStarted: true,
  isFrozen: true,
  noOfPlayers: 2,
  orderedPlayerIndices: [0, 1],
  currentPlayer: 0,
  cardsDrawnInTurn: 0,
  crashTilePosition: 0,
});

test('game over is sticky: later water changes cannot clear a loss', () => {
  const lost = { ...started(), gameOver: true, gameResult: 'loss' };
  const next = gameStateReducer(lost, { type: 'ADJUST_WATER', payload: { playerId: lost.players[0].id, amount: 1 } });
  expect(next.gameOver).toBe(true);
  expect(next.gameResult).toBe('loss');
});

test('a player reaching 0 water loses the game', () => {
  const s = started();
  const next = gameStateReducer(s, {
    type: 'ADJUST_WATER',
    payload: { playerId: s.players[0].id, amount: -s.players[0].maxWater },
  });
  expect(next.gameResult).toBe('loss');
});

const stormMovesNorth = { id: 999, type: 'storm_moves', moves: 1, direction: 'n' };

test('placing the last sand marker is not a loss', () => {
  const s = { ...started(), sandPile: 1, stormDeck: [stormMovesNorth] };
  const next = gameStateReducer(s, { type: 'DRAW_STORM_CARD' });
  expect(next.sandPile).toBe(0);
  expect(next.gameOver).toBe(false);
});

test('needing a sand marker when the pile is empty is a loss', () => {
  const s = { ...started(), sandPile: 0, stormDeck: [stormMovesNorth] };
  const next = gameStateReducer(s, { type: 'DRAW_STORM_CARD' });
  expect(next.gameResult).toBe('loss');
});

test('excavating the same tile twice only counts once', () => {
  const s = started();
  const tile = s.tiles.find(t => t.type === 'normal');
  const gear = { type: 'gear' };
  const once = gameStateReducer(s, { type: 'EXCAVATE_TILE', payload: { tileId: tile.id, treasure: gear } });
  const twice = gameStateReducer(once, { type: 'EXCAVATE_TILE', payload: { tileId: tile.id, treasure: gear } });
  expect(once.assignedEquipmentCount).toBe(1);
  expect(twice.assignedEquipmentCount).toBe(1);
});

test('removing sand from a clear tile does not grow the sand pile', () => {
  const s = started();
  const clear = s.tiles.find(t => t.sandLevel === 0 && t.type === 'normal');
  const next = gameStateReducer(s, { type: 'ADJUST_SAND', payload: { tileId: clear.id, amount: -1 } });
  expect(next.sandPile).toBe(s.sandPile);
});

test('drawing from an empty deck reshuffles the discard and draws', () => {
  const s = started();
  const [a, ...rest] = s.stormDeck;
  const next = gameStateReducer(
    { ...s, stormDeck: [], stormDiscard: [a, ...rest] },
    { type: 'DRAW_STORM_CARD' }
  );
  expect(next.lastDrawnCard).not.toBeNull();
  expect(next.stormDeck.length + next.stormDiscard.length).toBe(s.stormDeck.length);
});

test('moving a shield carrier moves the shield in a single action', () => {
  const s = started();
  const from = s.players[0].position;
  const to = from === 0 ? 1 : 0;
  const id = s.players[0].id;
  const withShield = {
    ...s,
    solarShieldActive: true,
    solarShieldTiles: [from],
    equipment: s.equipment.map((e, i) =>
      i === 0 ? { ...e, type: 'Solar Shield', playerId: id, active: true } : e
    ),
  };
  const next = gameStateReducer(withShield, { type: 'MOVE_PLAYER', payload: { playerId: id, newPosition: to } });
  expect(next.solarShieldTiles).toEqual([to]);
});

test('getCardsToDraw follows the storm-level tables', () => {
  expect(getCardsToDraw(1, 4)).toBe(2);
  expect(getCardsToDraw(6, 4)).toBe(4);
  expect(getCardsToDraw(7, 6)).toBe(4);
  expect(getCardsToDraw(14, 2)).toBe(7);
});

test('createInitialState gives independent, randomised games', () => {
  const a = createInitialState();
  const b = createInitialState();
  expect(a.tiles).not.toBe(b.tiles);
  expect(a.tiles[12].type).toBe('storm');
  expect(a.players.every(p => p.position !== 12)).toBe(true);
});

test('undo restores the previous state and NEW_GAME resets history', () => {
  const game = started();
  const s0 = { game, history: [] };
  const s1 = sessionReducer(s0, { type: 'ADJUST_WATER', payload: { playerId: game.players[0].id, amount: -1 } });
  expect(s1.history).toHaveLength(1);
  expect(sessionReducer(s1, { type: 'UNDO' }).game).toBe(game);
  const fresh = sessionReducer(s1, { type: 'NEW_GAME' });
  expect(fresh.history).toEqual([]);
  expect(fresh.game.gameStarted).toBe(false);
});

test('undo can reverse a game-ending move', () => {
  const game = started();
  const id = game.players[0].id;
  const lost = sessionReducer({ game, history: [] }, { type: 'ADJUST_WATER', payload: { playerId: id, amount: -99 } });
  expect(lost.game.gameOver).toBe(true);
  expect(sessionReducer(lost, { type: 'UNDO' }).game.gameOver).toBe(false);
});
