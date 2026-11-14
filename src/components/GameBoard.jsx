// // src/components/GameBoard.js
import React from 'react';
import Tile from './Tile';
import { useGameState } from '../contexts/GameStateProvider';
import './GameBoard.css';

function GameBoard() {
  const { state } = useGameState();

  return (
    <div className="game-board">
      {state.tiles.map((tile) => (
        <Tile key={tile.id} {...tile} />
      ))}
    </div>
  );
}

export default GameBoard;
