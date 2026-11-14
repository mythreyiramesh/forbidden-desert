// src/components/SandMeter.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './SandMeter.css';

const SandMeter = () => {
  const { state } = useGameState();
  const { stormLevel, cardsToDraw } = state;

  return (
    <div className="stat">
      <h3>Storm meter</h3>
      <span className="stat-figure num">{stormLevel}</span>
      <span className="stat-note">draw {cardsToDraw} cards</span>
    </div>
  );
};

export default SandMeter;
