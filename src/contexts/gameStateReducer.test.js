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

// ---- turn tracking, the action log and corrections ----

const turnOf = (game) => game.players[game.orderedPlayerIndices[game.currentPlayer]];
const playing = () => {
  const s = started();
  const [first, second] = s.orderedPlayerIndices.map((i) => s.players[i]);
  const placed = {
    ...s,
    players: s.players.map((p) => (p.id === first.id || p.id === second.id ? { ...p, position: 0 } : p)),
    tiles: s.tiles.map((t) => (t.id === 0 ? { ...t, type: 'normal', desertID: 12, sandLevel: 1 } : t)),
  };
  return { game: placed, first, second };
};

test("only the current player's own actions cost an action", () => {
  const { game, first, second } = playing();
  const target = game.tiles.find((t) => t.id !== 0 && t.type !== 'storm').id;
  const moved = gameStateReducer(game, { type: 'MOVE_PLAYER', payload: { playerId: first.id, newPosition: target } });
  expect(moved.actionsLeft).toBe(3);
  const other = gameStateReducer(moved, { type: 'MOVE_PLAYER', payload: { playerId: second.id, newPosition: target } });
  expect(other.actionsLeft).toBe(3); // somebody else being moved is free
  expect(turnOf(game).id).toBe(first.id);
});

test('removing sand, excavating and picking up a part each cost an action; water and a clear tile do not', () => {
  const { game, first } = playing();
  const removed = gameStateReducer(game, { type: 'ADJUST_SAND', payload: { tileId: 0, amount: -1 } });
  expect(removed.actionsLeft).toBe(3);
  const again = gameStateReducer(removed, { type: 'ADJUST_SAND', payload: { tileId: 0, amount: -1 } });
  expect(again.actionsLeft).toBe(3); // nothing was removed, nothing was spent
  const dug = gameStateReducer(removed, { type: 'EXCAVATE_TILE', payload: { tileId: 0, treasure: { type: 'gear', name: 'Gear 1' } } });
  expect(dug.actionsLeft).toBe(2);
  const drank = gameStateReducer(dug, { type: 'ADJUST_WATER', payload: { playerId: first.id, amount: -1 } });
  expect(drank.actionsLeft).toBe(2);
  const part = dug.parts[0];
  const picked = gameStateReducer({ ...dug, parts: dug.parts.map((p, i) => (i === 0 ? { ...p, tileId: 0 } : p)) }, { type: 'PICK_UP_PART', payload: { partId: part.id } });
  expect(picked.actionsLeft).toBe(1);
});

test('using the Time Throttler gives two extra actions', () => {
  const { game, first } = playing();
  const withThrottler = {
    ...game,
    equipment: game.equipment.map((e) => (e.type === 'Time Throttler' ? { ...e, playerId: first.id } : e)),
  };
  const id = withThrottler.equipment.find((e) => e.type === 'Time Throttler').id;
  const used = gameStateReducer(withThrottler, { type: 'USE_EQUIPMENT', payload: { equipmentId: id } });
  expect(used.actionsLeft).toBe(6);
});

test('next turn resets the counters and moves to the next player', () => {
  const { game } = playing();
  const spent = gameStateReducer(game, { type: 'ADJUST_ACTIONS', payload: { amount: -3 } });
  const drawn = { ...spent, cardsDrawnInTurn: 2 };
  const next = gameStateReducer(drawn, { type: 'NEXT_TURN' });
  expect(next.actionsLeft).toBe(4);
  expect(next.cardsDrawnInTurn).toBe(0);
  expect(next.turnNumber).toBe(2);
  expect(turnOf(next).id).not.toBe(turnOf(game).id);
});

test('actions left can be corrected by hand and never leaves its bounds', () => {
  const { game } = playing();
  expect(gameStateReducer(game, { type: 'ADJUST_ACTIONS', payload: { amount: 1 } }).actionsLeft).toBe(5);
  const low = gameStateReducer(game, { type: 'ADJUST_ACTIONS', payload: { amount: -100 } });
  expect(low.actionsLeft).toBe(-8);
});

test('the log records what happened, newest last, with turn and player', () => {
  const { game, first } = playing();
  const drawn = gameStateReducer({ ...game, stormDeck: [{ id: 1, type: 'sun_beats_down', description: 'Sun beats down' }] }, { type: 'DRAW_STORM_CARD' });
  const watered = gameStateReducer(drawn, { type: 'ADJUST_WATER', payload: { playerId: first.id, amount: 1 } });
  const last = drawn.log[drawn.log.length - 1];
  expect(last.text).toMatch(/Sun beats down/);
  expect(last.turn).toBe(1);
  expect(last.player).toBe(first.name);
  expect(watered.log.length).toBeGreaterThanOrEqual(drawn.log.length);
  const ids = watered.log.map((e) => e.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('a game-ending move is logged, and undo removes its entry too', () => {
  const { game, first } = playing();
  const s0 = { game, history: [], fixMode: false };
  const lost = sessionReducer(s0, { type: 'ADJUST_WATER', payload: { playerId: first.id, amount: -99 } });
  expect(lost.game.log.map((e) => e.text).join(' ')).toMatch(/Game over/);
  expect(sessionReducer(lost, { type: 'UNDO' }).game.log).toEqual(game.log);
});

test('adding sand takes a marker from the pile, and is refused when the pile is empty', () => {
  const { game } = playing();
  const added = gameStateReducer(game, { type: 'ADJUST_SAND', payload: { tileId: 0, amount: 1 } });
  expect(added.tiles.find((t) => t.id === 0).sandLevel).toBe(2);
  expect(added.sandPile).toBe(game.sandPile - 1);
  const empty = gameStateReducer({ ...game, sandPile: 0 }, { type: 'ADJUST_SAND', payload: { tileId: 0, amount: 1 } });
  expect(empty.tiles.find((t) => t.id === 0).sandLevel).toBe(1);
  const storm = game.tiles.find((t) => t.type === 'storm');
  expect(gameStateReducer(game, { type: 'ADJUST_SAND', payload: { tileId: storm.id, amount: 1 } })).toBe(game);
});

test('removing sand puts the marker back in the pile', () => {
  const { game } = playing();
  const removed = gameStateReducer(game, { type: 'ADJUST_SAND', payload: { tileId: 0, amount: -1 } });
  expect(removed.sandPile).toBe(game.sandPile + 1);
});

test('storm level and sand pile can be corrected, and the draw count follows the storm level', () => {
  const { game } = playing();
  const up = gameStateReducer({ ...game, stormLevel: 1 }, { type: 'ADJUST_STORM_LEVEL', payload: { delta: 1 } });
  expect(up.stormLevel).toBe(2);
  expect(up.cardsToDraw).toBe(getCardsToDraw(2, game.noOfPlayers));
  expect(gameStateReducer({ ...game, stormLevel: 1 }, { type: 'ADJUST_STORM_LEVEL', payload: { delta: -1 } }).stormLevel).toBe(1);
  expect(gameStateReducer(game, { type: 'ADJUST_SAND_PILE', payload: { delta: -3 } }).sandPile).toBe(game.sandPile - 3);
  expect(gameStateReducer({ ...game, sandPile: 0 }, { type: 'ADJUST_SAND_PILE', payload: { delta: -1 } }).sandPile).toBe(0);
});

test('used equipment can be restored', () => {
  const { game } = playing();
  const eq = game.equipment[0];
  const used = { ...game, equipment: game.equipment.map((e) => (e.id === eq.id ? { ...e, used: true, active: true } : e)) };
  const restored = gameStateReducer(used, { type: 'RESTORE_EQUIPMENT', payload: { equipmentId: eq.id } });
  const back = restored.equipment.find((e) => e.id === eq.id);
  expect(back.used).toBe(false);
  expect(back.active).toBe(false);
  expect(gameStateReducer(game, { type: 'RESTORE_EQUIPMENT', payload: { equipmentId: eq.id } })).toBe(game);
});

test('corrections mode is interface state: it does not enter the undo history', () => {
  const { game } = playing();
  const on = sessionReducer({ game, history: [], fixMode: false }, { type: 'TOGGLE_FIX_MODE' });
  expect(on.fixMode).toBe(true);
  expect(on.history).toEqual([]);
  expect(on.game).toBe(game);
  expect(sessionReducer(on, { type: 'NEW_GAME' }).fixMode).toBe(false);
});
