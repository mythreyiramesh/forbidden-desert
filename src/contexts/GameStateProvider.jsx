// src/contexts/GameStateProvider.js
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { gameStateReducer } from '../game/reducer';
import { createInitialState } from '../game/createInitialState';

const GameStateContext = createContext();

const STORAGE_KEY = 'forbidden-desert-save-v1';
const MAX_HISTORY = 100;

// Wraps the game reducer with undo history and "new game".
// Shape: { game, history } where history is a stack of earlier `game` states.
export function sessionReducer(session, action) {
  switch (action.type) {
    case 'NEW_GAME':
      return { game: createInitialState(), history: [] };
    case 'UNDO': {
      if (session.history.length === 0) return session;
      const history = session.history.slice(0, -1);
      return { game: session.history[session.history.length - 1], history };
    }
    default: {
      const game = gameStateReducer(session.game, action);
      if (game === session.game) return session;
      // Only moves made during play are undoable; setup changes just replace state.
      const history = session.game.gameStarted
        ? [...session.history, session.game].slice(-MAX_HISTORY)
        : [];
      return { game, history };
    }
  }
}

function loadSession() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (saved && saved.game && Array.isArray(saved.history)) return saved;
  } catch (e) {
    // ignore: unavailable or corrupt storage falls back to a new game
  }
  return { game: createInitialState(), history: [] };
}

export function GameStateProvider({ children }) {
  const [session, dispatch] = useReducer(sessionReducer, undefined, loadSession);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      // storage full or unavailable: the game still works, it just won't survive a refresh
    }
  }, [session]);

  const value = {
    state: session.game,
    dispatch,
    canUndo: session.history.length > 0,
  };

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}

export default GameStateProvider;
