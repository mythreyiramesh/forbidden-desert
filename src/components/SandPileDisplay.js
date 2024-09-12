// src/components/SandPileDisplay.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';

function SandPileDisplay() {
  const { state } = useGameState();

  return (
    <div className="sand-pile-display">
      Remaining Sand: {state.sandPile}
    </div>
  );
}

export default SandPileDisplay;
