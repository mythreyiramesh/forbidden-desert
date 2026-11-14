// src/components/TileFace.jsx
// Geometric faces for excavated tiles, drawn from the theme tokens (see TileFace.css).
import React from 'react';
import desertTiles from '../desertTiles.json';
import './TileFace.css';

const rotations = [0, 45, 90, 135, 180, 225, 270, 315];

function PartMark({ part }) {
  switch (part) {
    case 'engine': // hexagon
      return <polygon className="tf-fg" points="50,34 64,42 64,58 50,66 36,58 36,42" />;
    case 'propeller': // four blades
      return (
        <g className="tf-fg">
          <rect x="46" y="32" width="8" height="36" />
          <rect x="32" y="46" width="36" height="8" />
        </g>
      );
    case 'crystal': // diamond
      return <polygon className="tf-fg" points="50,32 66,50 50,68 34,50" />;
    default: // steering: a ring
      return <circle className="tf-fg-ring" cx="50" cy="50" r="13" />;
  }
}

function Face({ tile }) {
  switch (tile.type) {
    case 'gear':
      return (
        <>
          <rect width="100" height="100" className="f-paper3" />
          {rotations.map((deg) => (
            <rect key={deg} x="43" y="14" width="14" height="16" className="f-ink2" transform={`rotate(${deg} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="26" className="f-ink2" />
          <circle cx="50" cy="50" r="10" className="f-accent" />
        </>
      );
    case 'tunnel':
      return (
        <>
          <rect width="100" height="100" className="f-ink" />
          <path d="M18 100V54a32 32 0 0 1 64 0v46z" className="f-paper3" />
          <path d="M30 100V56a20 20 0 0 1 40 0v44z" className="f-water" />
          <path d="M41 100V58a9 9 0 0 1 18 0v42z" className="f-ink" />
        </>
      );
    case 'water': {
      const real = tile.name !== 'Fake Well';
      return real ? (
        <>
          <rect width="100" height="100" className="f-water" />
          <circle cx="50" cy="50" r="36" className="s-paper" />
          <circle cx="50" cy="50" r="25" className="s-paper" />
          <circle cx="50" cy="50" r="14" className="s-paper" />
          <circle cx="50" cy="50" r="5" className="f-paper" />
        </>
      ) : (
        <>
          <rect width="100" height="100" className="f-paper3" />
          <circle cx="50" cy="50" r="36" className="s-ink2 dashed" />
          <circle cx="50" cy="50" r="25" className="s-ink2 dashed" />
          <circle cx="50" cy="50" r="14" className="s-ink2 dashed" />
          <path d="M44 44l12 12M56 44L44 56" className="s-ink2" />
        </>
      );
    }
    case 'clue': {
      const horizontal = tile.direction === 'horizontal';
      return (
        <>
          <rect width="100" height="100" className={`f-part-${tile.part}`} />
          <g className="tf-fg">
            {horizontal ? (
              <>
                <rect x="20" y="46" width="60" height="8" />
                <polygon points="6,50 24,36 24,64" />
                <polygon points="94,50 76,36 76,64" />
              </>
            ) : (
              <>
                <rect x="46" y="20" width="8" height="60" />
                <polygon points="50,6 36,24 64,24" />
                <polygon points="50,94 36,76 64,76" />
              </>
            )}
          </g>
          <circle cx="50" cy="50" r="20" className={`f-part-${tile.part}`} />
          <PartMark part={tile.part} />
        </>
      );
    }
    case 'crash':
      return (
        <>
          <rect width="100" height="100" className="f-accent" />
          <polygon points="50,6 94,50 50,94 6,50" className="f-ink" />
          <polygon points="50,20 80,50 50,80 20,50" className="f-accent" />
          <polygon points="50,34 66,50 50,66 34,50" className="f-ink" />
        </>
      );
    default:
      return <rect width="100" height="100" className="f-paper3" />;
  }
}

export default function TileFace({ desertID }) {
  const tile = desertTiles.find((t) => t.id === desertID);
  if (!tile) return null;
  return (
    <>
      <svg
        className="tile-face"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <Face tile={tile} />
      </svg>
      <span className="visually-hidden">{tile.name}</span>
    </>
  );
}
