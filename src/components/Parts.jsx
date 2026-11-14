// src/components/Players.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import PartToken from './PartToken';
import { CheckIcon, DashIcon } from './Icons';
import './Parts.css';

const Mark = ({ found }) => (
  <>
    {found ? <span className="found-mark"><CheckIcon /></span> : <DashIcon />}
    <span className="visually-hidden">{found ? 'Yes' : 'No'}</span>
  </>
);
function Parts() {
  const { state } = useGameState();

  return (
    <div className="panel parts">
      <h3>Parts</h3>
      <table>
        <thead>
          <tr>
            <th>Part</th>
            <th>Horizontal</th>
            <th>Vertical</th>
            <th>Placed</th>
            <th>Picked up</th>
          </tr>
        </thead>
        <tbody>
          {state.parts.map((part) => (
            <tr key={part.id}>
              <td> <PartToken part={part} /></td>
              <td className={part.horizontalClue ? 'found' : ''}><Mark found={part.horizontalClue} /></td>
              <td className={part.verticalClue ? 'found' : ''}><Mark found={part.verticalClue} /></td>
              <td className={part.placed ? 'found' : ''}><Mark found={part.placed} /></td>
              <td className={part.pickedUp ? 'found' : ''}><Mark found={part.pickedUp} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Parts;
