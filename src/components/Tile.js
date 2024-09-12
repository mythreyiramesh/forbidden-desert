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
  // const [, drop] = useDrop({
  //   accept: 'PLAYER',
  //   drop: (item) => {
  //     dispatch({ type: 'MOVE_PLAYER', payload: { playerId: item.id, newPosition: id } });
  //   },
  // });
  // Find the description for the current tile
  const tileDescription = type !== 'storm' && desertID
    ? desertTiles.find(tile => tile.id === desertID)?.description
    : null;

  // console.log('Descriptions', tileDescription);
const removeSand = () => {
    if (sandLevel > 0) {
      dispatch({ type: 'ADJUST_SAND', payload: { tileId: id, amount: -1 } });
    }
  };
  // const adjustSand = (amount) => {
  //   if ((amount > 0 && state.sandPile > 0) || (amount < 0 && sandLevel > 0)) {
  //     dispatch({ type: 'ADJUST_SAND', payload: { tileId: id, amount } });
  //   }
  // };
const excavateTile = () => {
      dispatch({ type: 'EXCAVATE_TILE', payload: { tileId: id } });
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
          {!excavated ? (
            <button onClick={excavateTile} className="excavate-button">Excavate</button>
          ) : (
            tileDescription && <div className="tile-description">{tileDescription}</div>
          )}
        </div>
        /* <div className="sand-controls"> */
        /*   <button onClick={() => adjustSand(-1)}>-</button> */
        /*   <div className="sand-level">{sandLevel}</div> */
        /*   <button onClick={() => adjustSand(1)}>+</button> */
        /* </div> */
      )}
      {type === 'storm' && <div className="storm-icon">🌪️</div>}
      <div className="player-tokens">
        {playersOnTile.map(player => (
          <PlayerToken key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
  // return (
  //   <div className={`tile ${type} ${excavated ? 'excavated' : ''}`}>
  //     {type !== 'storm' && (
  //       <>
  //         <div className="sand-level">{sandLevel}</div>
  //         <button onClick={() => adjustSand(1)}>+</button>
  //         <button onClick={() => adjustSand(-1)}>-</button>
  //       </>
  //     )}
  //     {type === 'storm' && <div className="storm-icon">🌪️</div>}
  //      {playersOnTile.map(player => (
  //       <PlayerToken key={player.id} player={player} />
  //     ))}
  //     {/* {playersOnTile.map(player => ( */}
  //     {/*   <div key={player.id} className={`player-token ${player.type}`}></div> */}
  //     {/* ))} */}
  //   </div>
  // );
}

export default Tile;
// * // src/components/Tile.js
// // import React from 'react';
// import { useDrag, useDrop } from 'react-dnd';
// import { useGameState } from '../contexts/GameStateProvider';
// import './Tile.css';

// function Tile({ id, type, sandLevel }) {
//   const { dispatch } = useGameState();

//   const [{ isDragging }, drag] = useDrag({
//     type: 'TILE',
//     item: { id },
//     collect: (monitor) => ({
//       isDragging: !!monitor.isDragging(),
//     }),
//   });

//   const [, drop] = useDrop({
//     accept: 'TILE',
//     drop: (item) => {
//       dispatch({ type: 'MOVE_TILE', payload: { from: item.id, to: id } });
//     },
//   });

//   return (
//     <div
//       ref={(node) => drag(drop(node))}
//       className={`tile ${type} ${isDragging ? 'dragging' : ''}`}
//     >
//       <div className="sand-level">{sandLevel}</div>
//     </div>
//   );
// }

// export default Tile;
// src/components/Tile.js
// import React from 'react';
// import { useDrag, useDrop } from 'react-dnd';
// import { useGameState } from '../contexts/GameStateProvider';
// import './Tile.css';

// function Tile({ id, type, sandLevel, excavated }) {
//   const { dispatch, state } = useGameState();

//   const [{ isDragging }, drag] = useDrag({
//     type: 'TILE',
//     item: { id },
//     canDrag: type !== 'storm',
//     collect: (monitor) => ({
//       isDragging: !!monitor.isDragging(),
//     }),
//   });

//   const [, drop] = useDrop({
//     accept: 'TILE',
//     canDrop: () => type !== 'storm',
//     drop: (item) => {
//       // console.log('Dropping tile', item.id, 'onto', id);
//       dispatch({ type: 'MOVE_TILE', payload: { from: item.id, to: id } });
//     },
//   });

//   const adjustSand = (amount) => {
//     if (amount > 0 && state.sandPile > 0) {
//       dispatch({ type: 'ADJUST_SAND', payload: { tileId: id, amount } });
//     } else if (amount < 0 && sandLevel > 0) {
//       dispatch({ type: 'ADJUST_SAND', payload: { tileId: id, amount } });
//     }
//   };

//   return (
//     <div
//       ref={(node) => drag(drop(node))}
//       className={`tile ${type} ${isDragging ? 'dragging' : ''} ${excavated ? 'excavated' : ''}`}
//        style={{ opacity: isDragging ? 0.5 : 1, cursor: type !== 'storm' ? 'move' : 'default' }}
//     >
//       {type !== 'storm' && (
//         <>
//           <div className="sand-level">{sandLevel}</div>
//           <button onClick={() => adjustSand(1)}>+</button>
//           <button onClick={() => adjustSand(-1)}>-</button>
//         </>
//       )}
//       {type === 'storm' && <div className="storm-icon">🌪️</div>}
//     </div>
//   );
// }

// export default Tile;
