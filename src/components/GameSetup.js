// GameSetup.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { useGameState } from '../contexts/GameStateProvider';
import PlayerToken from './PlayerToken';
import desertTiles from '../desertTiles.json';

const PlayerSlot = ({ index, playerIndex, movePlayer }) => {
  const { state } = useGameState();
  const { isFrozen } = state;

  const [, drop] = useDrop({
    accept: 'PLAYER',
    drop: (item) => movePlayer(item.id, index),
  });

  return (
    <div ref={drop} style={{ width: '100px', height: '50px', border: '1px dashed black',
                             /* display: 'inline-block', */
                             margin: '5px',
                             opacity: isFrozen ? 0.5 : 1, // Reduce opacity to visually indicate disabled state
                             pointerEvents: isFrozen ? 'none' : 'auto', // Disable pointer events to make the slot non-interactive
                             display: 'flex',
                             justifyContent: 'center',
                             alignItems: 'center',
                           }}>
      {playerIndex !== undefined && <PlayerToken player={state.players[playerIndex]} />}
    </div>
  );
};

const GameSetup = () => {
  const { state, dispatch } = useGameState();
  const { isFrozen, gameStarted } = state;

  const handleStartGame = () => {
    const crashId = state.tiles.find(tile =>
      tile.desertID && desertTiles[tile.desertID - 1].type === 'crash'
    )?.id ?? null;
    const tunnelIds = state.tiles.reduce((acc, tile) => {
      if (tile.desertID && desertTiles[tile.desertID - 1].type === 'tunnel') {
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
    <div>
      <h3>Game Setup </h3>
      <div>
        <label>Number of Players: </label>
        <select value={state.noOfPlayers} onChange={handlePlayerCountChange} disabled={isFrozen}>
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Difficulty Level: </label>
        <select value={state.stormLevel} onChange={handleDifficultyChange} disabled={isFrozen}>
          <option value={1}>Novice</option>
          <option value={2}>Normal</option>
          <option value={3}>Intermediate</option>
          <option value={4}>Expert</option>
        </select>
      </div>
      <div>
        <h4>Select players:</h4>
        {state.players.map((player, index) => (
          <label key={player.id} style={{ display: 'inline-block', margin: '5px' }}>
            <input
              type="checkbox"
              checked={state.orderedPlayerIndices.includes(index)}
              onChange={(e) => handlePlayerSelection(e, index)}
              disabled = {
                (state.orderedPlayerIndices.length >= state.noOfPlayers && !state.orderedPlayerIndices.includes(index)) || isFrozen
              }
            />
            <div style={{opacity: isFrozen ? 0.5 : 1, // Reduce opacity to visually indicate disabled state
                         pointerEvents: isFrozen ? 'none' : 'auto', // Disable pointer events to make the slot non-interactive
                        }}>
            <PlayerToken player={player} />
            </div>
          </label>
        ))}
      </div>
      <div>
        <h5>Drag and drop to reorder selected players:</h5>
        {state.orderedPlayerIndices.map((playerIndex, index) => (
          <PlayerSlot key={index} index={index} playerIndex={playerIndex} movePlayer={movePlayer} />
        ))}
      </div>
      {isFrozen ? (
        <button onClick={handleUnfreeze} disabled={gameStarted}>Unfreeze Setup</button>
      ) : (
        <button onClick={handleFreeze}>Freeze Setup</button>
      )}
      <button onClick={handleStartGame} disabled={!isFrozen || gameStarted}>
        Start Game
      </button>
    </div>
  );
};

export default GameSetup;
