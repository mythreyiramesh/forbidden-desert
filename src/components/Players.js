// src/components/Players.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import PlayerToken from './PlayerToken';
import './Players.css';

function Players() {
  const { state, dispatch } = useGameState();

  const adjustWater = (playerId, amount) => {
    dispatch({ type: 'ADJUST_WATER', payload: { playerId, amount } });
  };

  return (
    <div className="players">
      <h2>Players</h2>
      {state.players.map((player) => (
        <div key={player.id} className="player">
          <PlayerToken player={player} />
          <span>{player.type}</span>
          <span>  {player.water}/{player.maxWater}</span>
          <button onClick={() => adjustWater(player.id, -1)}>-</button>
          <button onClick={() => adjustWater(player.id, 1)}>+</button>
        </div>
      ))}
    </div>
  );
  // return (
  //   <div className="players">
  //     <h2>Players</h2>
  //     {state.players.map((player, index) => (
  //       <div key={index} className="player">
  //         <h3>{player.type}</h3>
  //         <div>Water: {player.water}</div>
  //         <button onClick={() => adjustWater(index, -1)}>-</button>
  //         <button onClick={() => adjustWater(index, 1)}>+</button>
  //       </div>
  //     ))}
  //   </div>
  // );
}

export default Players;
