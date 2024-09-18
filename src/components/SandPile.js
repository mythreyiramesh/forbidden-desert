// src/components/SandPile.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './SandPile.css';

function SandPile() {
  const { state } = useGameState();

  return (
    <div className="sand-pile">
      <h3>Sand Pile</h3>
      <div>Remaining: {state.sandPile}</div>
    </div>
  );
}

export default SandPile;
