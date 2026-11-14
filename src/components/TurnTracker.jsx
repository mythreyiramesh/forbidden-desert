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
    <div className="turn-tracker">
      <h3>Current Turn:</h3>
      <p>Player: {players[orderedPlayerIndices[currentPlayer]].name}</p>
      <p>Drawn Cards: {cardsDrawnInTurn}</p>
          <button onClick={nextTurn}>
            Next Turn
          </button>
    </div>
  );
};

export default TurnTracker;
