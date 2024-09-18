// src/App.js
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import Players from './components/Players';
import Parts from './components/Parts';
import StormDeck from './components/StormDeck';
import SandPile from './components/SandPile';
import SandMeter from './components/SandMeter';
import GameOverAnimation from './components/GameOverAnimation';
import EquipmentManager from './components/EquipmentManager';
import { GameStateProvider, useGameState } from './contexts/GameStateProvider';
import './App.css';

// Create a wrapper component to use the game state hook
const GameContent = () => {
  const { gameOver, gameResult } = useGameState(); // Assuming these are in your game state

  return (
    <div className="App">
      <GameSetup />
      <GameBoard />
      <div className="sidebar">
        <Parts/>
        <Players />
        <SandMeter />
        <StormDeck />
        <SandPile />
        <EquipmentManager />
      </div>
      {gameOver && <GameOverAnimation result={gameResult} />}
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
