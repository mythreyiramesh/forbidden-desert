// src/components/StormDeck.js
import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './StormDeck.css';

function StormDeck() {
  const { state, dispatch } = useGameState();

  const drawCard = () => {
    dispatch({ type: 'DRAW_STORM_CARD' });
  };

  const revealCards = () => {
    const noOfCardsToReveal = Math.min(state.cardsToDraw, state.stormDeck.length);
    dispatch({ type: 'REVEAL_STORM_CARDS', payload: {noOfCards: noOfCardsToReveal} });
  };

  const moveCardToBottom = (index) => {
    dispatch({ type: 'MOVE_CARD_TO_BOTTOM', payload: {indexToMove: index} });
// Automatically finish revealing after moving a card
    dispatch({ type: 'FINISH_REVEALING' });
  };

const skipMoving = () => {
    dispatch({ type: 'FINISH_REVEALING' });
  };

  // Check if there's a meteorologist in the game
  const hasMeteorologistPlayer = state.orderedPlayerIndices
                                      .map(index => state.players[index])
                                      .some(player => player.type === "meteorologist");

  // Count the number of "sun_beats_down" and "storm_picks_up" cards
  const sunBeatsDownCount = state.stormDiscard.filter(card => card.type === 'sun_beats_down').length;
  const stormPicksUpCount = state.stormDiscard.filter(card => card.type === 'storm_picks_up').length;

  return (
    <div className="panel storm-deck">
      <h3>Storm deck</h3>
      {state.revealedCards.length === 0 ? (
        <div className="deck-actions">
          <button className="primary" onClick={drawCard} disabled={!state.gameStarted}>
            {state.stormDeck.length === 0 ? 'Shuffle deck' : 'Draw card'}
          </button>
          {hasMeteorologistPlayer && (
            <button onClick={revealCards} disabled={state.stormDeck.length === 0 || !state.gameStarted}>
              Reveal
            </button>
          )}
        </div>
      ) : (
        <div className="revealed">
          <h4>Revealed cards</h4>
          {state.revealedCards.map((card, index) => (
            <div key={index} className="revealed-card">
              <p>{card.description}</p>
              <button onClick={() => moveCardToBottom(index)}>
                Move to bottom
              </button>
            </div>
          ))}
          <button onClick={skipMoving}>Skip moving</button>
        </div>
      )}
      {state.lastDrawnCard && state.revealedCards.length === 0 && (
        <p className="last-card" aria-live="polite">{state.lastDrawnCard.description}</p>
      )}
      {state.revealedCards.length === 0 && (
        <dl className="deck-info">
          <div><dt>Cards</dt><dd className="num">{state.stormDeck.length}</dd></div>
          <div><dt>Suns</dt><dd className="num">{4 - sunBeatsDownCount}</dd></div>
          <div><dt>Storms</dt><dd className="num">{3 - stormPicksUpCount}</dd></div>
        </dl>
      )}
    </div>
  );
}

export default StormDeck;
