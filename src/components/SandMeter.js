// src/components/SandMeter.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './SandMeter.css';

const SandMeter = () => {
  const { state } = useGameState();
  const { stormLevel, cardsToDraw } = state;

  return (
    <div className="sand-meter">
      <h3>Storm Meter</h3>
      <p>Storm Level: {stormLevel}</p>
      <p>Draw {cardsToDraw} cards.</p>
    </div>
  );
};

export default SandMeter;
