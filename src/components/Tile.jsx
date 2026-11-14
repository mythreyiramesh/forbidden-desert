// src/components/Tile.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { useGameState } from '../contexts/GameStateProvider';
import PlayerToken from './PlayerToken';
import PartToken from './PartToken';
import TileFace from './TileFace';
import { StormIcon } from './Icons';
import './Tile.css';
import desertTiles from '../desertTiles.json';

function Tile({ id, type, sandLevel, excavated, desertID }) {
  const { dispatch, state, fixMode } = useGameState();
  const [{ isOver }, drop] = useDrop({
    accept: ['PLAYER', 'PART'],
    canDrop: () => {
      // Prevent dropping on storm tiles
      return type !== 'storm';
    },
    drop: (item) => {
      if (item.type === 'PLAYER') {
        dispatch({ type: 'MOVE_PLAYER', payload: { playerId: item.id, newPosition: id } });
      } else if (item.type === 'PART') {
        dispatch({ type: 'PLACE_PART', payload: { partId: item.id, tileId: id } });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  // Find the description for the current tile
  const tileDescription = type !== 'storm' && desertID
        ? desertTiles.find(tile => tile.id === desertID)?.name
        : null;

  const treasureFull = type !== 'storm' && desertID
        ? desertTiles.find(tile => tile.id === desertID)
        : null;

  const removeSand = () => {
    if (sandLevel > 0) {
      dispatch({ type: 'ADJUST_SAND', payload: { tileId: id, amount: -1 } });
    }
  };
  const addSand = () => {
    dispatch({ type: 'ADJUST_SAND', payload: { tileId: id, amount: 1 } });
  };
  const excavateTile = () => {
    dispatch({ type: 'EXCAVATE_TILE', payload: { tileId: id, treasure: treasureFull } });
  };

  const peekTile = () => {
    dispatch({ type: 'PEEK_TILE', payload: { tileId: id, terraScopeIndex: state.peekedTileIds.length-1 }})
  };

  const partsOnTile = state.parts.filter(part => part.tileId === id);

  const handlePickUp = (partId) => {
    dispatch({ type: 'PICK_UP_PART', payload: { partId } });
  };

  let playersOnTile;
  if (state.gameStarted) {
    playersOnTile = state.orderedPlayerIndices
                         .map(index => state.players[index])
                         .filter(player => player.position === id);
  } else {
    playersOnTile = [];
  }

  return (
    <div
      ref={drop}
      className={[
        'tile', type,
        excavated && 'excavated',
        !excavated && treasureFull?.type === 'water' && 'has-water',
        isOver && 'drag-over',
        state.terrascopeInUse && excavated && state.peekedTileIds.includes(null) && 'terrascope-active',
        state.peekedTileIds.includes(id) && 'peeked',
        sandLevel > 1 && 'blocked',
      ].filter(Boolean).join(' ')}
    >
      {excavated && type !== 'storm' && <TileFace desertID={desertID} />}
      {partsOnTile.length > 0 && (
        <div className="parts-on-tile">
          {partsOnTile.map(part => (
            <div key={part.id} className="part">
              <PartToken part={part} />
              {(playersOnTile.length > 0 && excavated) && <button className="pickup-button" onClick={() => handlePickUp(part.id)}>Pick up</button>}
            </div>
          ))}
        </div>
      )}
      {type !== 'storm' && sandLevel > 0 && (
        <div className="sand-controls">
          <button onClick={removeSand} className="remove-sand" disabled={!state.gameStarted}
            aria-label={`Remove sand (level ${sandLevel})`} title="Remove sand">{sandLevel}</button>
        </div>
      )}
      {fixMode && type !== 'storm' && (
        <button className="add-sand" onClick={addSand} disabled={state.sandPile <= 0}
          aria-label="Add sand" title="Add sand (correction)">+</button>
      )}
      {type !== 'storm' && (
        <div className="tile-actions">
          {!excavated ? (
            (state.terrascopeInUse && state.peekedTileIds.includes(null)) && !state.peekedTileIds.includes(id) ? (
              <button onClick={peekTile} className="peek-button">Peek</button>
            ) : state.peekedTileIds.includes(id) ? (
              <>
                <div className="tile-description">{tileDescription}</div>
                {(playersOnTile.length > 0 && sandLevel === 0) && <button onClick={excavateTile} className="excavate-button">Excavate</button>}
              </>
            ) : (
              (playersOnTile.length > 0 && sandLevel === 0) && <button onClick={excavateTile} className="excavate-button">Excavate</button>
            )
          ) : null}
          {!excavated && treasureFull.type === 'water' && <span className="visually-hidden">Water</span>}
        </div>
      )}
      {type === 'storm' && <div className="storm-icon" role="img" aria-label="The storm"><StormIcon /></div>}
      <div
        className="player-tokens"
        style={playersOnTile.length > 1
          ? { gridTemplateColumns: `repeat(${playersOnTile.length - 1}, minmax(0, var(--token-size))) var(--token-size)` }
          : undefined}
      >
        {playersOnTile.map(player => (
          <PlayerToken key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}

export default Tile;
