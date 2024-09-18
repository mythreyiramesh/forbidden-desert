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
    console.log(noOfCardsToReveal);
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
  // const finishRevealing = () => {
  //   dispatch({ type: 'FINISH_REVEALING' });
  // };

  // Check if there's a meteorologist in the game
  const hasMeteorologistPlayer = state.players.some(player => player.type === "meteorologist");

  // Count the number of "sun_beats_down" and "storm_picks_up" cards
  const sunBeatsDownCount = state.stormDiscard.filter(card => card.type === 'sun_beats_down').length;
  const stormPicksUpCount = state.stormDiscard.filter(card => card.type === 'storm_picks_up').length;

  return (
    <div className="storm-deck">
      <h2>Storm Deck</h2>
      {state.revealedCards.length === 0 ? (
        <>
          <button onClick={drawCard}>
            {state.stormDeck.length === 0 ? 'Shuffle Deck' : 'Draw Card'}
          </button>
          {hasMeteorologistPlayer && (
            <button onClick={revealCards} disabled={state.stormDeck.length === 0}>
              Reveal Cards
            </button>
          )}
        </>
      ) : (
        <div>
          <h3>Revealed Cards:</h3>
          {state.revealedCards.map((card, index) => (
            <div key={index}>
              <p>{card.description}</p>
              <button onClick={() => moveCardToBottom(index)}>
                Move to Bottom
              </button>
            </div>
          ))}
          <button onClick={skipMoving}>Skip Moving</button>
        </div>
      )}
      {state.lastDrawnCard && state.revealedCards.length === 0 && (
        <div>
          {/* <h3>Last Drawn Card:</h3> */}
          <p>{state.lastDrawnCard.description}</p>
        </div>
      )}
      {state.revealedCards.length === 0 && (
        <div>
        <h4>Deck Info:</h4>
          <p>Cards Remaining: {state.stormDeck.length}</p>
          <p>Sun Beats Down in discard: {sunBeatsDownCount}</p>
          <p>Storm Picks Up in discard: {stormPicksUpCount}</p>
        </div>
      )}
    </div>
  );

  // return (
  //   <div className="storm-deck">
  //     <h2>Storm Deck</h2>
  //     {state.revealedCards.length === 0 ? (
  //       <>
  //         <button onClick={drawCard}>
  //           {state.stormDeck.length === 0 ? 'Shuffle Deck' : 'Draw Card'}
  //         </button>
  //         {hasMeteorologistPlayer && (
  //           <button onClick={revealCards} disabled={state.stormDeck.length === 0}>
  //             Reveal Cards
  //           </button>
  //         )}
  //       </>
  //     ) : (
  //       <div>
  //         <h3>Revealed Cards:</h3>
  //         {state.revealedCards.map((card, index) => (
  //           <div key={index}>
  //             <p>{card.description}</p>
  //             <button onClick={() => moveCardToBottom(index)}>
  //               Move to Bottom
  //             </button>
  //           </div>
  //         ))}
  //         <button onClick={finishRevealing}>Finish Revealing</button>
  //       </div>
  //     )}
  //     {state.lastDrawnCard && state.revealedCards.length === 0 && (
  //       <div>
  //         {/* <h3>Last Drawn Card:</h3> */}
  //         <p>{state.lastDrawnCard.description}</p>
  //       </div>
  //     )}
  //     {state.revealedCards.length === 0 && (
  //       <div>
  //         <p>Cards Remaining: {state.stormDeck.length}</p>
  //         <p>Sun Beats Down in discard: {sunBeatsDownCount}</p>
  //         <p>Storm Picks Up in discard: {stormPicksUpCount}</p>
  //       </div>
  //     )}
  //   </div>
  // );
  // return (
  //   <div className="storm-deck">
  //     <h2>Storm Deck</h2>
  //     {!isRevealing ? (
  //       <>
  //         <button onClick={drawCard}>
  //           {state.stormDeck.length === 0 ? 'Shuffle Deck' : 'Draw Card'}
  //         </button>
  //         <button onClick={revealCards} disabled={state.stormDeck.length === 0}>
  //           Reveal Cards (Meteorologist)
  //         </button>
  //       </>
  //     ) : (
  //       <div>
  //         <h3>Revealed Cards:</h3>
  //         {state.revealedCards.map((card, index) => (
  //           <div key={index}>
  //             <p>{card.description}</p>
  //             <button onClick={() => moveCardToBottom(index)}>
  //               Move to Bottom
  //             </button>
  //           </div>
  //         ))}
  //         <button onClick={finishRevealing}>Finish Revealing</button>
  //       </div>
  //     )}
  //     {state.lastDrawnCard && !isRevealing && (
  //       <div>
  //         <h3>Last Drawn Card:</h3>
  //         <p>{state.lastDrawnCard.description}</p>
  //       </div>
  //     )}
  //     <div>
  //       <p>Cards Remaining: {state.stormDeck.length}</p>
  //       <p>Sun Beats Down in discard: {sunBeatsDownCount}</p>
  //       <p>Storm Picks Up in discard: {stormPicksUpCount}</p>
  //     </div>
  //   </div>
  // );
  // return (
  //   <div className="storm-deck">
  //     <h2>Storm Deck</h2>
  //     <button onClick={drawCard}>
  //       {state.stormDeck.length === 0 ? (
  //         <div>Shuffle Deck</div>
  //       ) :
  //        <div>Draw Card</div>
  //       }
  //     </button>
  //     {state.lastDrawnCard ? (
  //       <div>
  //         <p>{state.lastDrawnCard.description}</p>
  //       </div>
  //     ) : (
  //       <p>No card drawn yet</p>
  //     )}
  //     <div>
  //     <p>Cards Remaining: {state.stormDeck.length }</p>
  //       <p>Sun Beats Down in discard: {sunBeatsDownCount}</p>
  //       <p>Storm Picks Up in discard: {stormPicksUpCount}</p>
  //     </div>
  //   </div>
  // );
}

export default StormDeck;
