import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './TurnTracker.css';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// What the table should do next, from the counters.
function turnPrompt({ actionsLeft, cardsDrawnInTurn, cardsToDraw }) {
  const over = actionsLeft < 0 ? `Over by ${plural(-actionsLeft, 'action')}. ` : '';
  const cardsLeft = cardsToDraw - cardsDrawnInTurn;
  if (cardsLeft <= 0) {
    const unused = actionsLeft > 0 ? ` ${plural(actionsLeft, 'action')} went unused.` : '';
    return { complete: true, text: `${over}Storm cards done. Pass to the next player.${unused}` };
  }
  if (cardsDrawnInTurn > 0) {
    return { complete: false, text: `${over}Draw ${plural(cardsLeft, 'more storm card')}.` };
  }
  if (actionsLeft > 0) {
    return { complete: false, text: `Take your actions, then draw ${plural(cardsToDraw, 'storm card')}.` };
  }
  return { complete: false, text: `${over}Actions used. Draw ${plural(cardsToDraw, 'storm card')}.` };
}

const TurnTracker = () => {
  const { state, dispatch } = useGameState();
  const { players, orderedPlayerIndices, currentPlayer, cardsDrawnInTurn, cardsToDraw, actionsLeft, turnNumber } = state;
  const prompt = turnPrompt({ actionsLeft, cardsDrawnInTurn, cardsToDraw });

  const nextTurn = () => dispatch({ type: 'NEXT_TURN' });
  const adjustActions = (amount) => dispatch({ type: 'ADJUST_ACTIONS', payload: { amount } });

  return (
    <div className="panel turn-tracker">
      <h3>Current turn</h3>
      <p className="turn-player">{players[orderedPlayerIndices[currentPlayer]].name}</p>
      <p className="stat-note">Turn <span className="num">{turnNumber}</span></p>

      <div className="turn-counters">
        <div className="counter">
          <span className="stat-note">Actions left</span>
          <div className="counter-row">
            <button className="step" onClick={() => adjustActions(-1)} aria-label="One fewer action left">−</button>
            <span className={`stat-figure num ${actionsLeft < 0 ? 'is-over' : ''}`}>{actionsLeft}</span>
            <button className="step" onClick={() => adjustActions(1)} aria-label="One more action left">+</button>
          </div>
        </div>
        <div className="counter">
          <span className="stat-note">Storm cards</span>
          <span className="stat-figure num">{cardsDrawnInTurn}<span className="of">/{cardsToDraw}</span></span>
        </div>
      </div>

      <p className="turn-prompt" aria-live="polite">{prompt.text}</p>
      <button className={prompt.complete ? 'primary' : ''} onClick={nextTurn}>Next turn</button>
    </div>
  );
};

export default TurnTracker;
