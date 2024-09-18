// src/components/SandMeter.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './SandMeter.css';

const SandMeter = () => {
  const { state } = useGameState();
  const { stormLevel, cardsToDraw } = state;

  return (
    <div className="sand-meter">
      <h2>Sand Meter</h2>
      <p>Storm Level: {stormLevel}</p>
      <p>Cards to Draw: {cardsToDraw}</p>
    </div>
  );
};

export default SandMeter;
