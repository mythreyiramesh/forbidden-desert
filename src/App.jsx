// src/App.js
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import Players from './components/Players';
import Parts from './components/Parts';
import StormDeck from './components/StormDeck';
import SandPile from './components/SandPile';
import SandMeter from './components/SandMeter';
import TurnTracker from './components/TurnTracker';
import GameOverAnimation from './components/GameOverAnimation';
import EquipmentManager from './components/EquipmentManager';
import Legend from './components/Legend';
import { InfoIcon } from './components/Icons';
import { GameStateProvider, useGameState } from './contexts/GameStateProvider';
import './App.css';

// Create a wrapper component to use the game state hook
const GameContent = () => {
  const { state, dispatch, canUndo } = useGameState();
  const [legendOpen, setLegendOpen] = useState(false);

  const newGame = () => {
    if (state.gameStarted && !state.gameOver &&
        !window.confirm('Abandon the current game and start a new one?')) return;
    dispatch({ type: 'NEW_GAME' });
  };

  return (
    <div className="App">
      <header className="app-bar">
        <h1>Forbidden Desert</h1>
        <div className="toolbar">
          <button
            className="with-icon"
            onClick={() => setLegendOpen((open) => !open)}
            aria-expanded={legendOpen}
            aria-controls="legend"
          >
            <InfoIcon /> Legend
          </button>
          <button onClick={() => dispatch({ type: 'UNDO' })} disabled={!canUndo}>Undo</button>
          <button onClick={newGame}>New Game</button>
        </div>
      </header>
      <div className="grid-container">
        <aside className="setup-column">
          {!state.gameStarted && <GameSetup />}
          {state.gameStarted && (
            <div className="panel stats">
              <SandPile />
              <SandMeter />
            </div>
          )}
          {state.gameStarted && <TurnTracker />}
          {state.gameStarted && <StormDeck />}
        </aside>
        <main className="game-column">
          <GameBoard />
        </main>
        <aside className="parts-column">
          <Players />
          <Parts />
          <EquipmentManager />
        </aside>
      </div>
      {legendOpen && <Legend onClose={() => setLegendOpen(false)} />}
      {state.gameOver && <GameOverAnimation result={state.gameResult} onNewGame={newGame} />}
    </div>
  );
};

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <GameStateProvider>
        <GameContent />
      </GameStateProvider>
    </DndProvider>
  );
}

export default App;
