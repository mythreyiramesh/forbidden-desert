// src/components/PlayerToken.js
import React from 'react';
import { useDrag } from 'react-dnd';
import { useGameState } from '../contexts/GameStateProvider';
import './PlayerToken.css';

// One outline per role, so players can be told apart by shape as well as colour.
const SHAPES = {
  explorer: <circle cx="16" cy="16" r="13" />,
  waterCarrier: <path d="M16 3C22 10 28 15 28 20a12 12 0 0 1-24 0C4 15 10 10 16 3z" />,
  climber: <polygon points="16,3 29,28 3,28" />,
  archeologist: <polygon points="16,2 30,16 16,30 2,16" />,
  navigator: <polygon points="9,4 23,4 30,16 23,28 9,28 2,16" />,
  meteorologist: <polygon points="11,3 21,3 29,11 29,21 21,29 11,29 3,21 3,11" />,
};
// Letters sit a little lower in the shapes that narrow towards the top.
const LETTER_Y = { waterCarrier: 20, climber: 20 };
const LETTER_SIZE = { climber: 12.5 };

export function PlayerGlyph({ type }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <g className="token-halo">{SHAPES[type] ?? SHAPES.explorer}</g>
      <g className="token-shape">{SHAPES[type] ?? SHAPES.explorer}</g>
      <text x="16" y={LETTER_Y[type] ?? 16} textAnchor="middle" dominantBaseline="central"
        style={LETTER_SIZE[type] ? { fontSize: LETTER_SIZE[type] } : undefined}>
        {type.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
}

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
      role="img"
      aria-label={player.name}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isPlayerInOrder ? 'move' : 'not-allowed'
      }}
    >
      <PlayerGlyph type={player.type} />
    </div>
  );
}

export default PlayerToken;
