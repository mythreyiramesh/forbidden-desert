// src/components/SandPile.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './SandPile.css';

function SandPile() {
  const { state } = useGameState();

  return (
    <div className="sand-pile">
      <h2>Sand Pile</h2>
      <div>Remaining Sand: {state.sandPile}</div>
    </div>
  );
}

export default SandPile;
