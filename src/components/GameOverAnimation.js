import React from 'react';
import { useSpring, animated } from 'react-spring';
import './GameOverAnimation.css';

const GameOverAnimation = ({ result }) => {
  const props = useSpring({
    opacity: 1,
    transform: 'scale(1)',
    from: { opacity: 0, transform: 'scale(0.5)' },
  });
  // console.log(result);
  return (
    <animated.div style={props} className="game-over-animation">
      <h2>{result === 'win' ? 'You Won!' : 'Game Over'}</h2>
      <p>{result === 'win' ? 'Congratulations!' : 'Better luck next time!'}</p>
    </animated.div>
  );
};

export default GameOverAnimation;
