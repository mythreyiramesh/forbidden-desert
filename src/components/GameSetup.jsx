// GameSetup.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { useGameState } from '../contexts/GameStateProvider';
import PlayerToken from './PlayerToken';
import desertTiles from '../desertTiles.json';
import './GameSetup.css';

const PlayerSlot = ({ index, playerIndex, movePlayer }) => {
  const { state } = useGameState();
  const { isFrozen } = state;

  const [, drop] = useDrop({
    accept: 'PLAYER',
    drop: (item) => movePlayer(item.id, index),
  });

  return (
    <div ref={drop} className={`player-slot ${isFrozen ? 'is-frozen' : ''}`}>
      {playerIndex !== undefined && <PlayerToken player={state.players[playerIndex]} />}
    </div>
  );
};

const GameSetup = () => {
  const { state, dispatch } = useGameState();
  const { isFrozen, gameStarted } = state;

  const handleStartGame = () => {
    const typeOf = (tile) => desertTiles.find(t => t.id === tile.desertID)?.type;
    const crashId = state.tiles.find(tile => tile.desertID && typeOf(tile) === 'crash')?.id ?? null;
    const tunnelIds = state.tiles.reduce((acc, tile) => {
      if (tile.desertID && typeOf(tile) === 'tunnel') {
        acc.push(tile.id);
      }
      return acc;
    }, []);
    dispatch({ type: 'SET_TILE_POSITIONS', payload: {crashID: crashId, tunnelIDs: tunnelIds}});
    dispatch({ type: 'START_GAME' });
  }

  const handleFreeze = () => {
    dispatch({ type: 'FREEZE_GAME_SETUP' });
  };

  const handleUnfreeze = () => {
    dispatch({ type: 'UNFREEZE_GAME_SETUP' });
  };

  const handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value);
    dispatch({ type: 'SET_PLAYER_COUNT', payload: {count: count} });
  };

  const handleDifficultyChange = (e) => {
    const level = parseInt(e.target.value);
    dispatch({ type: 'SET_STORM_LEVEL', payload: {level: level, count: state.noOfPlayers} });
  };

  const movePlayer = (playerId, toIndex) => {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    const fromIndex = state.orderedPlayerIndices.indexOf(playerIndex);
    const newOrderedIndices = [...state.orderedPlayerIndices];
    const [movedIndex] = newOrderedIndices.splice(fromIndex, 1);
    newOrderedIndices.splice(toIndex, 0, movedIndex);
    dispatch({ type: 'SET_ORDERED_PLAYER_INDICES', payload: {newOrder: newOrderedIndices} });
  };

  const handlePlayerSelection = (e, playerIndex) => {
    const isSelected = e.target.checked;
    if (isSelected && state.orderedPlayerIndices.length < state.noOfPlayers) {
      dispatch({ type: 'ADD_ORDERED_PLAYER_INDEX', payload: {newIndex: playerIndex} });
    } else if (!isSelected) {
      dispatch({ type: 'REMOVE_ORDERED_PLAYER_INDEX', payload: {newIndex: playerIndex} });
    }
  };

  return (
    <div className="panel setup">
      <h3>Game setup</h3>
      <div className="field">
        <label htmlFor="player-count">Number of players</label>
        <select id="player-count" value={state.noOfPlayers} onChange={handlePlayerCountChange} disabled={isFrozen}>
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="difficulty">Difficulty level</label>
        <select id="difficulty" value={state.stormLevel} onChange={handleDifficultyChange} disabled={isFrozen}>
          <option value={1}>Novice</option>
          <option value={2}>Normal</option>
          <option value={3}>Intermediate</option>
          <option value={4}>Expert</option>
        </select>
      </div>
      <div className="field">
        <h4>Select players:</h4>
        <div className="player-picks">
        {state.players.map((player, index) => (
          <label key={player.id} className="player-pick" title={player.name}>
            <input
              type="checkbox"
              checked={state.orderedPlayerIndices.includes(index)}
              onChange={(e) => handlePlayerSelection(e, index)}
              disabled = {
                (state.orderedPlayerIndices.length >= state.noOfPlayers && !state.orderedPlayerIndices.includes(index)) || isFrozen
              }
            />
            <div className={isFrozen ? 'is-frozen' : ''}>
              <PlayerToken player={player} />
            </div>
          </label>
        ))}
        </div>
      </div>
      <div className="field">
        <h4>Play order</h4>
        <p className="stat-note">Drag to reorder the selected players.</p>
        <div className="player-slots">
        {state.orderedPlayerIndices.map((playerIndex, index) => (
          <PlayerSlot key={index} index={index} playerIndex={playerIndex} movePlayer={movePlayer} />
        ))}
        </div>
      </div>
      <div className="setup-actions">
        {isFrozen ? (
          <button onClick={handleUnfreeze} disabled={gameStarted}>Unfreeze setup</button>
        ) : (
          <button onClick={handleFreeze}>Freeze setup</button>
        )}
        <button className="primary" onClick={handleStartGame} disabled={!isFrozen || gameStarted}>
          Start game
        </button>
      </div>
    </div>
  );
};

export default GameSetup;
