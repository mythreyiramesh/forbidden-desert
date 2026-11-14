import React from 'react';
import { useSpring, animated } from 'react-spring';
import './GameOverAnimation.css';

const GameOverAnimation = ({ result, onNewGame }) => {
  const props = useSpring({
    opacity: 1,
    scale: 1,
    from: { opacity: 0, scale: 0.5 },
  });
  return (
    <div className="game-over-backdrop">
      <animated.div style={props} className="game-over-animation">
        <h2>{result === 'win' ? 'You Won!' : 'Game Over'}</h2>
        <p>{result === 'win' ? 'Congratulations!' : 'Better luck next time!'}</p>
        <button className="primary" onClick={onNewGame}>New Game</button>
        <p className="game-over-hint">Or press Undo to take back the last move.</p>
      </animated.div>
    </div>
  );
};

export default GameOverAnimation;
