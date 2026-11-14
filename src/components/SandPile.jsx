// src/components/SandPile.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './SandPile.css';

function SandPile() {
  const { state } = useGameState();

  return (
    <div className="stat">
      <h3>Sand pile</h3>
      <span className="stat-figure num">{state.sandPile}</span>
      <span className="stat-note">markers left</span>
    </div>
  );
}

export default SandPile;
