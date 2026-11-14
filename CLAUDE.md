# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A React (Vite) stand-in for the Forbidden Desert board game, used for screenshare play. It deliberately does **not** automate most rules (legality of moves, action counts, equipment effects are the players' responsibility) — see `README.md` for which mechanics are automated vs. manual. Don't add automation beyond what the README describes unless asked.

## Commands

- `npm run dev` — Vite dev server (served under `/forbidden-desert/`)
- `npm run build` / `npm run preview` — production build to `dist/` and local preview
- `npm run deploy` — builds and publishes `dist/` to GitHub Pages (`gh-pages -d dist`)
- `npm test` — Vitest (reducer tests only, node environment); single test: `npx vitest run -t "name"`

## Architecture

- **Game logic lives in `src/game/`**, with no React in it: `createInitialState.js` (fresh randomised game; call per game, never at module scope), `reducer.js` (one `switch` on action type delegating to a handler per action), `rules.js` (shuffle, storm-draw tables), `tracking.js` (turn bookkeeping that wraps the reducer).
- **`src/contexts/GameStateProvider.jsx`** wraps the game reducer in a `sessionReducer` (`{ game, history }`) adding `UNDO` and `NEW_GAME`, and autosaves the whole session to `localStorage` (`forbidden-desert-save-v2`). `useGameState()` returns `{ state, dispatch, canUndo, fixMode }`. `fixMode` (corrections tools showing) is interface state beside `game`, not part of it, so it is never undone. If the shape of game state changes, bump the storage key. The game reducer ignores all actions once `gameOver` is set; undo is the way out.
- **Turn tracking and the log are a wrapper, not part of the handlers.** `gameStateReducer` runs `applyAction` and then `trackAction(prev, action, next)`, which charges the current player's actions (move, remove sand, excavate, pick up a part; Time Throttler gives 2), and appends a plain-English entry to `state.log`. A new action that should appear in the log needs a case in `describe()` in `tracking.js`; one that costs an action needs a case in `actionDelta()`. Tiles swap places when the storm moves, so a tile's place is its index in `tiles`, never its `id`.
- **Player `id` is not the array index.** `players[]` is in file order (e.g. Explorer id 2 at index 0); `orderedPlayerIndices` holds array indices, while water, shield and move actions take ids.
- **Board** is a 5x5 grid (positions 0–24); `tiles[i].id` is the board position, `desertID` points into `desertTiles.json` (not sorted by id: always `.find()`). Storm movement swaps tiles, so players/parts follow positions via tile id.
- **Components** (`src/components/*.jsx`) are thin views that dispatch single actions; keep multi-step rules (e.g. move + shield + win check) inside the reducer. Drag-and-drop uses react-dnd (HTML5 backend).
- **Static data** in `src/*.json`; tile faces are SVG drawn in `components/TileFace.jsx` from the theme tokens, keyed by `desertID`.
