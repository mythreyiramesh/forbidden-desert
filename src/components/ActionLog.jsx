import React from 'react';
import { useGameState } from '../contexts/GameStateProvider';
import './ActionLog.css';

// Newest turn first, and within a turn the newest entry first.
function groupByTurn(log) {
  const groups = [];
  for (let i = log.length - 1; i >= 0; i--) {
    const entry = log[i];
    const last = groups[groups.length - 1];
    if (last && last.turn === entry.turn) last.entries.push(entry);
    else groups.push({ turn: entry.turn, player: entry.player, entries: [entry] });
  }
  return groups;
}

function ActionLog() {
  const { state } = useGameState();
  const groups = groupByTurn(state.log);

  return (
    <div className="panel action-log">
      <h3>Log</h3>
      {groups.length === 0 ? (
        <p className="stat-note">Moves, draws and changes appear here.</p>
      ) : (
        <div className="log-scroll" role="log" aria-label="Action log" tabIndex={0}>
          {groups.map((group) => (
            <section key={`${group.turn}-${group.entries[0].id}`}>
              <h4>Turn <span className="num">{group.turn}</span>, {group.player}</h4>
              <ul>
                {group.entries.map((entry) => <li key={entry.id}>{entry.text}</li>)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActionLog;
