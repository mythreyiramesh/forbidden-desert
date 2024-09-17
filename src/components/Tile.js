// src/components/Tile.js
import React from 'react';
import { useDrop } from 'react-dnd';
import { useGameState } from '../contexts/GameStateProvider';
import PlayerToken from './PlayerToken';
import PartToken from './PartToken';
import './Tile.css';
import desertTiles from '../desertTiles.json';

function Tile({ id, type, sandLevel, excavated, desertID }) {
  const { dispatch, state } = useGameState();
  const [{ isOver }, drop] = useDrop({
    accept: ['PLAYER', 'PART'],
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

  const imagePath = `./tile_images/${desertID}.png`;
  const removeSand = () => {
    if (sandLevel > 0) {
      dispatch({ type: 'ADJUST_SAND', payload: { tileId: id, amount: -1 } });
    }
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

  const playersOnTile = state.players.filter(player => player.position === id);

  return (
    <div
      ref={drop}
      className={`tile ${type} ${excavated ? 'excavated' : ''} ${isOver ? 'drag-over' : ''}
${state.terrascopeInUse && excavated && state.peekedTileIds.includes(null) ? 'terrascope-active' : ''}
${state.peekedTileIds.includes(id) ? 'peeked' : ''}`}
      style={excavated ? { backgroundImage: `url(${imagePath})` } : {}}
    >
      {/* {!excavated && type === 'water' && <div className="water-icon">💧</div>} */}
      {partsOnTile.length > 0 && (
        <div className="parts-on-tile">
          {partsOnTile.map(part => (
            <div key={part.id} className="part">
              <PartToken part={part} />
              {excavated && <button className="pickup-button" onClick={() => handlePickUp(part.id)}>✓</button>}
            </div>
          ))}
        </div>
      )}
      {/* {type !== 'storm' && ( */}
      {/*   <div> */}
      {/*     <div className="sand-controls"> */}
      {/*       <div className="sand-level-container"> */}
      {/*         <div className="sand-level">{sandLevel}</div> */}
      {/*         {sandLevel > 0 && ( */}
      {/*           <button onClick={removeSand} className="remove-sand">-</button> */}
      {/*         )} */}
      {/*       </div> */}
      {/*     </div> */}
      {/*     {!excavated ? ( */}
      {/*       state.terrascopeInUse && state.peekedTileIds.includes(null) ? ( */}
      {/*         <button onClick={peekTile} className="peek-button">Peek</button> */}
      {/*       ) : state.peekedTileIds.includes(id) ? ( */}
      {/*         <> */}
      {/*           <div className="tile-description">{tileDescription}</div> */}
      {/*           {playersOnTile.length > 0 && <button onClick={excavateTile} className="excavate-button">Excavate</button>} */}
      {/*         </> */}
      {/*       ) : ( */}
      {/*         playersOnTile.length > 0 && <button onClick={excavateTile} className="excavate-button">Excavate</button> */}
      {/*       ) */}
      {/*     ) : tileDescription ? ( */}
      {/*       <div className="tile-description">{tileDescription}</div> */}
      {/*     ) : null} */}
      {/*     {/\* Add this line to show the water icon *\/} */}
      {/*     {!excavated && type === 'water' && <div className="water-icon">💧</div>} */}
      {/*   </div> */}
      {/* )} */}
{type !== 'storm' && (
        <div>
          <div className="sand-controls">
            <div className="sand-level-container">
              <div className="sand-level">{sandLevel}</div>
              {sandLevel > 0 && (
                <button onClick={removeSand} className="remove-sand">-</button>
              )}
            </div>
          </div>
          {!excavated ? (
            state.terrascopeInUse && state.peekedTileIds.includes(null) ? (
              <button onClick={peekTile} className="peek-button">Peek</button>
            ) : state.peekedTileIds.includes(id) ? (
              <>
                <div className="tile-description">{tileDescription}</div>
                {playersOnTile.length > 0 && <button onClick={excavateTile} className="excavate-button">Excavate</button>}
              </>
            ) : (
              playersOnTile.length > 0 && <button onClick={excavateTile} className="excavate-button">Excavate</button>
            )
          ) : null}
          {!excavated && treasureFull.type === 'water' && <div className="water-icon">💧</div>}
        </div>
      )}
      {/* {type !== 'storm' && ( */}
      {/*   <div> */}
      {/*     <div className="sand-controls"> */}
      {/*       <div className="sand-level-container"> */}
      {/*         <div className="sand-level">{sandLevel}</div> */}
      {/*         {sandLevel > 0 && ( */}
      {/*           <button onClick={removeSand} className="remove-sand">-</button> */}
      {/*         )} */}
      {/*       </div> */}
      {/*     </div> */}

      {/*     {!excavated ? ( */}
      {/*       state.terrascopeInUse && state.peekedTileIds.includes(null) ? ( */}
      {/*         <button onClick={peekTile} className="peek-button">Peek</button> */}
      {/*       ) : state.peekedTileIds.includes(id) ? ( */}
      {/*         <> */}
      {/*           <div className="tile-description">{tileDescription}</div> */}
      {/*           {playersOnTile.length > 0 && <button onClick={excavateTile} className="excavate-button">Excavate</button>} */}
      {/*         </> */}
      {/*       ) : ( */}
      {/*         playersOnTile.length > 0 && <button onClick={excavateTile} className="excavate-button">Excavate</button> */}
      {/*       ) */}
      {/*     ) : tileDescription ? ( */}
      {/*       <div className="tile-description">{tileDescription}</div> */}
      {/*     ) : null} */}
      {/*     {!excavated && treasureFull.type === 'water' && <div className="water-icon">💧</div>} */}
      {/*   </div> */}
      {/* )} */}
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
