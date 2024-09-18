// src/components/SandMeter.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './SandMeter.css';

const SandMeter = () => {
  const { state } = useGameState();
  const { stormLevel, noOfPlayers, cardsToDraw } = state;

  const getCardsToDraw = () => {
    if (noOfPlayers === 2) {
      if (stormLevel >= 14) return 7;
      if (stormLevel >= 12) return 6;
      if (stormLevel >= 9) return 5;
      if (stormLevel >= 5) return 4;
      if (stormLevel >= 2) return 3;
      return 2;
    } else if (noOfPlayers === 3) {
      if (stormLevel >= 15) return 7;
      if (stormLevel >= 13) return 6;
      if (stormLevel >= 10) return 5;
      if (stormLevel >= 6) return 4;
      if (stormLevel >= 2) return 3;
      return 2;
    } else if (noOfPlayers === 4) {
      if (stormLevel >= 15) return 7;
      if (stormLevel >= 13) return 6;
      if (stormLevel >= 10) return 5;
      if (stormLevel >= 6) return 4;
      if (stormLevel >= 2) return 3;
      return 2;
    } else {
      if (stormLevel >= 16) return 7;
      if (stormLevel >= 14) return 6;
      if (stormLevel >= 11) return 5;
      if (stormLevel >= 7) return 4;
      if (stormLevel >= 2) return 3;
      return 2;
    }
  };

  return (
    <div className="sand-meter">
      <h2>Sand Meter</h2>
      <p>Storm Level: {stormLevel}</p>
      <p>Cards to Draw: {getCardsToDraw()}</p>
    </div>
  );
};

export default SandMeter;
