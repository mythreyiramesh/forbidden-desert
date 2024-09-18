// src/components/StormDeck.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './StormDeck.css';

function StormDeck() {
  const { state, dispatch } = useGameState();

  // if (state.stormDiscard.length === state.stormDeck.length) {
  //   const lastDrawnCard = state.stormDiscard[state.stormDiscard.length];
  // } else {
  //   const lastDrawnCard = state.stormDiscard[state.stormDiscard.length - 1];
  // }
  // const drawCard = () => {
  //   const newState = drawStormCard(state);
  //   dispatch({ type: 'DRAW_STORM_CARD', newState });
  //   setLastDrawnCard(newState.stormDiscard[newState.stormDiscard.length - 1]);
  // };
  const drawCard = () => {
    dispatch({ type: 'DRAW_STORM_CARD' });
  };

  return (
    <div className="storm-deck">
      <h2>Storm Deck</h2>
      <button onClick={drawCard}>Draw Card</button>
      {state.lastDrawnCard ? (
        <div>
          {/* <h3>Last Drawn Card:</h3> */}
          <p>{state.lastDrawnCard.description}</p>
        </div>
      ) : (
        <p>No card drawn yet</p>
      )}
    </div>
  );
}

export default StormDeck;
