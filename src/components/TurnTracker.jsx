// src/components/SandMeter.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './TurnTracker.css';

const TurnTracker = () => {
  const { state, dispatch } = useGameState();
  const { players, orderedPlayerIndices, currentPlayer, cardsDrawnInTurn } = state;

  const nextTurn = () => {
    dispatch({ type: 'NEXT_TURN' });
  };

  return (
    <div className="panel turn-tracker">
      <h3>Current turn</h3>
      <p className="turn-player">{players[orderedPlayerIndices[currentPlayer]].name}</p>
      <p className="stat-note">Cards drawn: <span className="num">{cardsDrawnInTurn}</span></p>
      <button className="primary" onClick={nextTurn}>Next turn</button>
    </div>
  );
};

export default TurnTracker;
