// src/components/StormDeck.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './StormDeck.css';

function StormDeck() {
  const { state, dispatch } = useGameState();
  const lastDrawnCard = state.stormDiscard[state.stormDiscard.length - 1];

  const drawCard = () => {
    dispatch({ type: 'DRAW_STORM_CARD' });
  };

  return (
    <div className="storm-deck">
      <h2>Storm Deck</h2>
      <div>Storm Level: {state.stormLevel}</div>
      <button onClick={drawCard}>Draw Card</button>
      {lastDrawnCard ? (
        <div>
          <h3>Last Drawn Card:</h3>
          <p>{lastDrawnCard.description}</p>
        </div>
      ) : (
        <p>No card drawn yet</p>
      )}
    </div>
  );
}

export default StormDeck;
