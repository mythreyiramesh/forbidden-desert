// src/App.js
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GameBoard from './components/GameBoard';
import Players from './components/Players';
import Parts from './components/Parts';
import StormDeck from './components/StormDeck';
import SandPile from './components/SandPile';
import SandMeter from './components/SandMeter';
import EquipmentManager from './components/EquipmentManager';
import { GameStateProvider } from './contexts/GameStateProvider';
import './App.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <GameStateProvider>
        <div className="App">
          <GameBoard />
          <div className="sidebar">
            <Parts/>
            <Players />
            <SandMeter />
            <StormDeck />
            <SandPile />
            <EquipmentManager />
          </div>
        </div>
      </GameStateProvider>
    </DndProvider>
  );
}

export default App;
