// src/components/StormCardDisplay.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';

function StormCardDisplay() {
  const { state } = useGameState();
  const lastDrawnCard = state.stormDiscard[state.stormDiscard.length - 1];

  return (
    <div className="storm-card-display">
      {lastDrawnCard ? (
        <div>
          <h3>Last Drawn Card:</h3>
          <p>{lastDrawnCard.description}</p>
        </div>
      ) : (
        <p>No card drawn yet</p>
      )}
    </div>
  );
}

export default StormCardDisplay;
