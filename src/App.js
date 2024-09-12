// src/App.js
// // // src/App.js
// import React from 'react';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import GameBoard from './components/GameBoard';
// import SandPileDisplay from './components/SandPileDisplay';
// import StormCardDisplay from './components/StormCardDisplay';
// import GameStateProvider, { useGameState } from './contexts/GameStateProvider';
// import './App.css';

// function GameContent() {
//   const { dispatch } = useGameState();

//   const drawCard = () => {
//     dispatch({ type: 'DRAW_STORM_CARD' });
//   };

//   return (
//     <div className="App">
//       <GameBoard />
//       <div className="sidebar">
//         <SandPileDisplay />
//         <StormCardDisplay />
//         <button onClick={drawCard}>Draw Storm Card</button>
//       </div>
//     </div>
//   );
// }

// function App() {
//   return (
//     <DndProvider backend={HTML5Backend}>
//       <GameStateProvider>
//         <GameContent />
//       </GameStateProvider>
//     </DndProvider>
//   );
// }

// export default App;
// import React from 'react';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import GameBoard from './components/GameBoard';
// import Players from './components/Players';
// import StormDeck from './components/StormDeck';
// import SandPile from './components/SandPile';
// // import SandPileDisplay from './components/SandPileDisplay';
// // import StormCardDisplay from './components/StormCardDisplay';
// import GameStateProvider, { useGameState } from './contexts/GameStateProvider';
// import './App.css';

// function App() {
//   const { dispatch } = useGameState();

//   const drawCard = () => {
//     dispatch({ type: 'DRAW_STORM_CARD' });
//   };

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <GameStateProvider>
//         <div className="App">
//           <GameBoard />
//           <div className="sidebar">
//             <Players />
//             <StormDeck />
//             <SandPile />
//             {/* <SandPileDisplay /> */}
//             {/* <StormCardDisplay /> */}
//             <button onClick={drawCard}>Draw Storm Card</button>
//           </div>
//         </div>
//       </GameStateProvider>
//     </DndProvider>
//   );
// }

// export default App;
// src/App.js
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GameBoard from './components/GameBoard';
import Players from './components/Players';
import StormDeck from './components/StormDeck';
import SandPile from './components/SandPile';
import { GameStateProvider } from './contexts/GameStateProvider';
import './App.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <GameStateProvider>
        <div className="App">
          <GameBoard />
          <div className="sidebar">
            <Players />
            <StormDeck />
            <SandPile />
          </div>
        </div>
      </GameStateProvider>
    </DndProvider>
  );
}

export default App;
