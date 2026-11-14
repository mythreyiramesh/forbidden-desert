// src/components/EquipmentToken.jsx
import React from 'react';
import './EquipmentToken.css';

// Geometric glyphs on a 24 x 24 grid, drawn with the current ink colour.
const GLYPHS = {
  'Dune Blaster': (
    <>
      <rect x="3" y="9" width="8" height="6" className="solid" />
      <path d="M13 12h8M13 8l7-3M13 16l7 3" />
    </>
  ),
  'Jet Pack': (
    <>
      <rect x="5" y="3" width="5" height="12" className="solid" />
      <rect x="14" y="3" width="5" height="12" className="solid" />
      <path d="M5 18l2.500 4 2.500-4zM14 18l2.500 4 2.500-4z" className="solid" />
    </>
  ),
  'Solar Shield': (
    <>
      <circle cx="12" cy="12" r="4" className="solid" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  Terrascope: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 1v6M12 17v6M1 12h6M17 12h6" />
    </>
  ),
  'Extra Water Bottle': (
    <path d="M12 3c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12z" className="solid" />
  ),
  'Time Throttler': (
    <>
      <path d="M5 3h14M5 21h14" />
      <path d="M7 3h10l-5 9zM7 21h10l-5-9z" className="solid" />
    </>
  ),
};

function EquipmentToken({ type, active = false }) {
  return (
    <span className={`equipment-token ${active ? 'is-active' : ''}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {GLYPHS[type] ?? GLYPHS.Terrascope}
      </svg>
    </span>
  );
}

export default EquipmentToken;
