import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './EquipmentManager.css';

function EquipmentManager() {
  const { state, dispatch } = useGameState();

  const assignEquipment = (equipmentId, playerId) => {
    dispatch({ type: 'ASSIGN_EQUIPMENT', payload: { equipmentId, playerId } });
    // console.log("Assigned equipment", state.equipment.find(eq => eq.id === equipmentId));
  };

  const tryEquipment = (equipmentId) => {
    dispatch({ type: 'USE_EQUIPMENT', payload: { equipmentId } });
  };

  const availableEquipment = state.equipmentIds
    .slice(0, state.assignedEquipmentCount)
    .map(id => state.equipment.find(eq => eq.id === id))
    .filter(item => !item.used);  // Filter out used equipment

return (
 <div className="equipment-manager">
      <h2>Equipment (Available: {availableEquipment.length})</h2>
      {availableEquipment.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Carried By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availableEquipment.map(item => (
              <tr key={item.id}>
                <td>{item.type}</td>
                <td>
                  <select
                    value={item.playerId || ''}
                    onChange={(e) => assignEquipment(item.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {state.players.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => tryEquipment(item.id)}
                    disabled={!item.playerId}
                  >
                    Use Equipment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No equipment available. Excavate gear tiles to reveal equipment.</p>
      )}
    </div>
    // <div className="equipment-manager">
    //   <h2>Equipment (Available: {state.assignedEquipmentCount})</h2>
    //   {availableEquipment.length > 0 ? (
    //     <table>
    //       <thead>
    //         <tr>
    //           <th>Type</th>
    //           <th>Carried By</th>
    //           <th>Action</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {availableEquipment.map(item => (
    //           <tr key={item.id}>
    //             <td>{item.type}</td>
    //             <td>
    //               <select
    //                 value={item.playerId || ''}
    //                 onChange={(e) => assignEquipment(item.id, e.target.value)}
    //               >
    //                 <option value="">Unassigned</option>
    //                 {state.players.map(player => (
    //                   <option key={player.id} value={player.id}>
    //                     {player.name}
    //                   </option>
    //                 ))}
    //               </select>
    //             </td>
    //             <td>
    //               <button
    //                 onClick={() => tryEquipment(item.id)}
    //                 disabled={!item.playerId || item.used}
    //               >
    //                 Use Equipment
    //               </button>
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   ) : (
    //     <p>No equipment available yet. Excavate gear tiles to reveal equipment.</p>
    //   )}
    // </div>
  );
  // return (
  //   <div className="equipment-manager">
  //     <h2>Equipment</h2>
  //     <table>
  //       <thead>
  //         <tr>
  //           <th>Type</th>
  //           <th>Carried By</th>
  //           <th>Action</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {state.equipmentIds.slice(0, state.assignedEquipmentCount).map(equipmentId => {
  //           const item = state.equipment.find(eq => eq.id === equipmentId);
  //           return (
  //             <tr key={item.id}>
  //               <td>{item.type}</td>
  //               <td>
  //                 <select
  //                   value={item.playerId || ''}
  //                   onChange={(e) => assignEquipment(item.id, e.target.value)}
  //                 >
  //                   <option value="">Unassigned</option>
  //                   {state.players.map(player => (
  //                     <option key={player.id} value={player.id}>
  //                       {player.name}
  //                     </option>
  //                   ))}
  //                 </select>
  //               </td>
  //               <td>
  //                 <button
  //                   onClick={() => tryEquipment(item.id)}
  //                   disabled={!item.playerId || item.used}
  //                 >
  //                   Use Equipment
  //                 </button>
  //               </td>
  //             </tr>
  //           );
  //         })}
  //         {/* {state.equipment.filter(item => !item.used).map(item => ( */}
  //         {/*   <tr key={item.id}> */}
  //         {/*     <td>{item.type}</td> */}
  //         {/*     <td> */}
  //         {/*       <select */}
  //         {/*         value={item.playerId || ''} */}
  //         {/*         onChange={(e) => assignEquipment(item.id, e.target.value)} */}
  //         {/*       > */}
  //         {/*         <option value="">Unassigned</option> */}
  //         {/*         {state.players.map(player => ( */}
  //         {/*           <option key={player.id} value={player.id}> */}
  //         {/*             {player.name} */}
  //         {/*           </option> */}
  //         {/*         ))} */}
  //         {/*       </select> */}
  //         {/*     </td> */}
  //         {/*     <td> */}
  //         {/*       <button onClick={() => tryEquipment(item.id)}> */}
  //         {/*         Use Equipment */}
  //         {/*       </button> */}
  //         {/*     </td> */}
  //         {/*   </tr> */}
  //         {/* ))} */}
  //       </tbody>
  //     </table>
  //   </div>
  // );
}

export default EquipmentManager;
