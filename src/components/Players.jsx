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

  if (state.orderedPlayerIndices.length === 0) return null;

  return (
<div className="panel players">
  <h3>Water</h3>
  <div className="player-container">
    {state.orderedPlayerIndices.map((index) => {
      const player = state.players[index];
      return (
        <div
          key={player.id}
          className={`player ${state.gameStarted ? '' : 'is-idle'}`}
        >
          <div className="player-icon-container">
            <PlayerToken player={player} />
          </div>
          <div className="player-controls">
            <span className="player-name">{player.name}</span>
            <div className="water-pips" role="img" aria-label={`${player.water} of ${player.maxWater} water`}>
              {Array.from({ length: player.maxWater }, (_, i) => (
                <span key={i} className={i < player.water ? 'pip full' : 'pip'} />
              ))}
            </div>
            <span className="water-count num">{player.water}/{player.maxWater}</span>
            <div className="buttons">
              <button className="step" onClick={() => adjustWater(player.id, -1)} aria-label={`${player.name} loses water`}>−</button>
              <button className="step" onClick={() => adjustWater(player.id, 1)} aria-label={`${player.name} gains water`}>+</button>
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
