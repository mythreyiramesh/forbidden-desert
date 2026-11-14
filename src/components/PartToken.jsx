// src/components/PlayerToken.js
import React from 'react';
import { useDrag } from 'react-dnd';
import './PartToken.css';


// The same marks that sit at the centre of the clue tiles.
const OUTLINES = {
  engine: <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" />,
  propeller: <path d="M13 3h6v10h10v6H19v10h-6V19H3v-6h10z" />,
  crystal: <polygon points="16,2 29,16 16,30 3,16" />,
  steering: <circle cx="16" cy="16" r="13" />,
};
export const PART_NAMES = { engine: 'Engine', propeller: 'Propeller', crystal: 'Crystal', steering: 'Steering' };

export function PartGlyph({ type }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <g className="token-halo">{OUTLINES[type] ?? OUTLINES.engine}</g>
      <g className="token-shape">{OUTLINES[type] ?? OUTLINES.engine}</g>
      {type === 'steering' && <circle className="token-hole" cx="16" cy="16" r="5" />}
    </svg>
  );
}

function PartToken({ part }) {
  const canPlacePart = part.horizontalClue && part.verticalClue && !part.placed;
  const [{ isDragging }, drag] = useDrag({
    type: 'PART',
    item: { id: part.id, type: 'PART'},
    canDrag: canPlacePart,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={canPlacePart ? drag : null} // Only apply the drag ref if the player is in order
      className={`part-token ${part.type} ${canPlacePart ? 'draggable' : 'non-draggable'}`}
      role="img"
      aria-label={PART_NAMES[part.type] ?? part.type}
      title={PART_NAMES[part.type] ?? part.type}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: canPlacePart ? 'move' : 'not-allowed'
      }}
    >
      <PartGlyph type={part.type} />
    </div>
  );
}

export default PartToken;
