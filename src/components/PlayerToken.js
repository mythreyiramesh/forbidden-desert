// src/components/PlayerToken.js
import React from 'react';
import { useDrag } from 'react-dnd';
import { useGameState } from '../contexts/GameStateProvider';
import './PlayerToken.css';

function PlayerToken({ player }) {

  const [{ isDragging }, drag] = useDrag({
    type: 'PLAYER',
    item: { id: player.id, type: 'PLAYER' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`player-token ${player.type}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {player.type.charAt(0).toUpperCase()}
    </div>
  );
}

export default PlayerToken;
