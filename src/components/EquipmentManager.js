import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './EquipmentManager.css';

const EquipmentManager = ({ players, onEquipmentChange }) => {
  const [equipment, setEquipment] = useGameState([]);

  useEffect(() => {
    // Fetch equipment data from your game state or API
    // For this example, we'll use the JSON data directly
    const equipmentData = [
      { id: 1, type: "Dune Blaster", used: false },
      { id: 2, type: "Dune Blaster", used: false },
      { id: 3, type: "Dune Blaster", used: false },
      { id: 4, type: "Dune Blaster", used: false },
      { id: 5, type: "Jet Pack", used: false },
      { id: 6, type: "Jet Pack", used: false },
      { id: 7, type: "Jet Pack", used: false },
      { id: 8, type: "Jet Pack", used: false },
      { id: 9, type: "Solar Shield", used: false },
      { id: 10, "type": "Solar Shield", used: false },
      { id: 11, type: "Extra Water Bottle", used: false },
      { id: 12, type: "Extra Water Bottle", used: false }
    ];
    setEquipment(equipmentData);
  }, []);

  const handlePlayerChange = (equipmentId, newPlayerId) => {
    setEquipment(prevEquipment =>
      prevEquipment.map(item =>
        item.id === equipmentId ? { ...item, playerId: newPlayerId } : item
      )
    );
    onEquipmentChange(equipmentId, newPlayerId);
  };

  const handleUseEquipment = (equipmentId) => {
    setEquipment(prevEquipment =>
      prevEquipment.map(item =>
        item.id === equipmentId ? { ...item, used: true } : item
      )
    );
    onEquipmentChange(equipmentId, null, true);
  };

  return (
    <div className="equipment-manager">
      <h2>Equipment</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Carried By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {equipment.filter(item => !item.used).map(item => (
            <tr key={item.id}>
              <td>{item.type}</td>
              <td>
                <select
                  value={item.playerId || ''}
                  onChange={(e) => handlePlayerChange(item.id, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => handleUseEquipment(item.id)}>
                  Use Equipment
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentManager;
