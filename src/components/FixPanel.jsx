import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './FixPanel.css';

const Stepper = ({ label, value, onChange, minusLabel, plusLabel }) => (
  <div className="fix-row">
    <span>{label}</span>
    <div className="counter-row">
      <button className="step" onClick={() => onChange(-1)} aria-label={minusLabel}>−</button>
      <span className="fix-value num">{value}</span>
      <button className="step" onClick={() => onChange(1)} aria-label={plusLabel}>+</button>
    </div>
  </div>
);

// Corrections for when the real board and the app disagree. Everything here is undoable.
function FixPanel() {
  const { state, dispatch } = useGameState();

  return (
    <div className="panel fix-panel">
      <h3>Corrections</h3>
      <Stepper
        label="Storm level"
        value={state.stormLevel}
        onChange={(delta) => dispatch({ type: 'ADJUST_STORM_LEVEL', payload: { delta } })}
        minusLabel="Lower the storm level"
        plusLabel="Raise the storm level"
      />
      <Stepper
        label="Sand pile"
        value={state.sandPile}
        onChange={(delta) => dispatch({ type: 'ADJUST_SAND_PILE', payload: { delta } })}
        minusLabel="Take a marker out of the sand pile"
        plusLabel="Put a marker into the sand pile"
      />
      <p className="stat-note">
        Press + on a tile to add sand to it. Used equipment can be restored from the equipment list.
        Undo takes back any correction.
      </p>
    </div>
  );
}

export default FixPanel;
