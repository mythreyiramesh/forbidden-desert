// src/components/PlayerToken.js
import React from 'react';
import { useDrag } from 'react-dnd';
import './PartToken.css';


function PartToken({ part, onDrop }) {
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
      ref={drag}
      className={`part-token ${part.type}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {part.type.charAt(0).toUpperCase()}
    </div>
  );
}

export default PartToken;
