// src/components/Tile.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { useGameState } from '../contexts/GameStateProvider';
import PlayerToken from './PlayerToken';
import './Tile.css';
import desertTiles from '../desertTiles.json';

function Tile({ id, type, sandLevel, excavated, desertID }) {
  const { dispatch, state } = useGameState();
  const [{ isOver }, drop] = useDrop({
    accept: 'PLAYER',
    drop: (item) => {
      dispatch({ type: 'MOVE_PLAYER', payload: { playerId: item.id, newPosition: id } });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  // Find the description for the current tile
  const tileDescription = type !== 'storm' && desertID
    ? desertTiles.find(tile => tile.id === desertID)?.name
    : null;

  const treasureType = type !== 'storm' && desertID
    ? desertTiles.find(tile => tile.id === desertID)?.type
    : null;

const removeSand = () => {
    if (sandLevel > 0) {
      dispatch({ type: 'ADJUST_SAND', payload: { tileId: id, amount: -1 } });
    }
  };
const excavateTile = () => {
  dispatch({ type: 'EXCAVATE_TILE', payload: { tileId: id, treasure: treasureType } });
  };

const playersOnTile = state.players.filter(player => player.position === id);
return (
    <div
      ref={drop}
      className={`tile ${type} ${excavated ? 'excavated' : ''} ${isOver ? 'drag-over' : ''}`}
    >
      {type !== 'storm' && (
        <div>
        <div className="sand-controls">
          <div className="sand-level">{sandLevel}</div>
          {sandLevel > 0 && (
            <button onClick={removeSand} className="remove-sand">-</button>
          )}
        </div>
          {!excavated && playersOnTile.length > 0 ? (
            <button onClick={excavateTile} className="excavate-button">Excavate</button>
          ) : excavated && tileDescription ? (
            <div className="tile-description">{tileDescription}</div>
          ) : null}
        </div>
      )}
      {type === 'storm' && <div className="storm-icon">🌪️</div>}
      <div className="player-tokens">
        {playersOnTile.map(player => (
          <PlayerToken key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}

export default Tile;
