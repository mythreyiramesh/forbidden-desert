// src/components/Players.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import PlayerToken from './PlayerToken';
import './Players.css';

function Players() {
  const { state, dispatch } = useGameState();

  const adjustWater = (playerId, amount) => {
    dispatch({ type: 'ADJUST_WATER', payload: { playerId, amount } });
  };

  return (
<div className="players">
  {/* <h2>Players</h2> */}
  <div className="player-container">
    {state.orderedPlayerIndices.map((index) => {
      const player = state.players[index];
      return (
        <div
          key={player.id}
          className="player"
          style={{
            opacity: !state.gameStarted ? 0.5 : 1, // Reduce opacity to visually indicate disabled state
            pointerEvents: !state.gameStarted ? 'none' : 'auto', // Disable pointer events to make the slot non-interactive
          }}
        >
          <div className="player-icon-container">
            <PlayerToken player={player} />
          </div>
          <div className="player-controls">
            <span>{player.water}/{player.maxWater}</span>
            <div className="buttons">
              <button onClick={() => adjustWater(player.id, -1)}>-</button>
              <button onClick={() => adjustWater(player.id, 1)}>+</button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
  );
}

export default Players;
