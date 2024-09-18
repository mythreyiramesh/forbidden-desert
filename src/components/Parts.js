// src/components/Players.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import PartToken from './PartToken';
import './Parts.css';
function Parts() {
  const { state } = useGameState();

  return (
    <div className="parts">
      {/* <h2>Parts</h2> */}
      <table>
        <thead>
          <tr>
            <th>Part</th>
            <th>Horizontal</th>
            <th>Vertical</th>
            <th>Placed</th>
            <th>Picked Up</th>
          </tr>
        </thead>
        <tbody>
          {state.parts.map((part) => (
            <tr key={part.id}>
              <td> <PartToken part={part} /></td>
              <td className={part.horizontalClue ? 'found' : ''}></td>
              <td className={part.verticalClue ? 'found' : ''}></td>
              <td className={part.placed ? 'found' : ''}></td>
              <td className={part.pickedUp ? 'found' : ''}></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Parts;
