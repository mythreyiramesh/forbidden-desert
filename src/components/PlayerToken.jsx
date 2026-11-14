// src/components/PlayerToken.js
import React from 'react';
import { useDrag } from 'react-dnd';
import { useGameState } from '../contexts/GameStateProvider';
import './PlayerToken.css';

function PlayerToken({ player }) {
  const { state } = useGameState();

  // Check if the player is in the orderedPlayerIndices
  const isPlayerInOrder = state.orderedPlayerIndices.includes(state.players.findIndex(p => p.id === player.id));

  const [{ isDragging }, drag] = useDrag({
    type: 'PLAYER',
    item: { id: player.id, type: 'PLAYER', position: player.position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => isPlayerInOrder, // Only allow dragging if the player is in order
  });

  return (
    <div
      ref={isPlayerInOrder ? drag : null} // Only apply the drag ref if the player is in order
      className={`player-token ${player.type} ${isPlayerInOrder ? 'draggable' : 'non-draggable'}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isPlayerInOrder ? 'move' : 'not-allowed'
      }}
    >
      {player.type.charAt(0).toUpperCase()}
    </div>
  );
}

export default PlayerToken;
