import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import EquipmentToken from './EquipmentToken';
import './EquipmentManager.css';

function EquipmentManager() {
  const { state, dispatch, fixMode } = useGameState();

  const assignEquipment = (equipmentId, playerId) => {
    dispatch({ type: 'ASSIGN_EQUIPMENT', payload: { equipmentId, playerId } });
  };

  const tryEquipment = (equipmentId) => {
    dispatch({ type: 'USE_EQUIPMENT', payload: { equipmentId } });
  };

  const deactivateShield = (equipmentId) => {
    dispatch( {type: 'MAKE_TILE_UNSHIELDED', payload: {equipmentId}} );
    dispatch({ type: 'DEACTIVATE_SHIELD', payload: { equipmentId } });
  };

  const usedEquipment = state.equipmentIds
    .slice(0, state.assignedEquipmentCount)
    .map(id => state.equipment.find(eq => eq.id === id))
    .filter(item => item.used);

  const availableEquipment = state.equipmentIds
    .slice(0, state.assignedEquipmentCount)
    .map(id => state.equipment.find(eq => eq.id === id))
    .filter(item => !item.used);  // Filter out used equipment

return (
 <div className="panel equipment-manager">
      <h3>Equipment (Available: <span className="num">{availableEquipment.length}</span>)</h3>
      {availableEquipment.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Item and carrier</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availableEquipment.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="equipment-type">
                  <EquipmentToken type={item.type} active={!!item.active} />
                  <div className="equipment-info">
                  <span>{item.type}</span>
                  <select
                    aria-label={`Carried by (${item.type})`}
                    value={item.playerId ?? ''}
                    disabled={!!item.active}
                    onChange={(e) => assignEquipment(item.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {state.orderedPlayerIndices.map(index => {
                      const player = state.players[index];
                      return (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      );
                    })}
                  </select>
                  </div>
                  </div>
                </td>
                <td className="equipment-actions">
                  {item.playerId != null && !state.terrascopeInUse && !item.active && (
                    <button onClick={() => tryEquipment(item.id)}>Use</button>
                  )}
                  {state.terrascopeInUse === item.id && (
                    <button onClick={() => dispatch({ type: 'CANCEL_TERRASCOPE' })}>Cancel</button>
                  )}
                  <button
                    onClick={() => deactivateShield(item.id)}
                    style={{
                      display: (item.active) ? 'inline-block' : 'none'
                    }}
                  >
                    Stop
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="stat-note">No equipment yet. Excavate gear tiles to find some.</p>
      )}
      {fixMode && usedEquipment.length > 0 && (
        <div className="used-equipment">
          <h4>Used equipment</h4>
          <ul>
            {usedEquipment.map(item => (
              <li key={item.id}>
                <EquipmentToken type={item.type} />
                <span>{item.type}</span>
                <button onClick={() => dispatch({ type: 'RESTORE_EQUIPMENT', payload: { equipmentId: item.id } })}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default EquipmentManager;
