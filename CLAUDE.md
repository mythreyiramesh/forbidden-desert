# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A React (Create React App) stand-in for the Forbidden Desert board game, used for screenshare play. It deliberately does **not** automate most rules (legality of moves, action counts, equipment effects are the players' responsibility) — see `README.md` for which mechanics are automated vs. manual. Don't add automation beyond what the README describes unless asked.

## Commands

- `npm start` — dev server
- `npm run build` — production build
- `npm run deploy` — builds and publishes to GitHub Pages (`gh-pages -d build`)
- `npm test` — Jest via react-scripts (`npm test -- --watchAll=false -t "name"` for a single test). Note `src/App.test.js` is the unmodified CRA stub ("learn react") and fails.

## Architecture

- **Single global state via reducer.** `src/contexts/GameStateProvider.js` holds `initialState`, one big `gameStateReducer` (a `switch` on action type that delegates to a named handler function per action, e.g. `MOVE_STORM` → `moveStorm`), and the `useGameState()` hook returning `{ state, dispatch }`. All game logic (storm movement, sun-beats-down water loss, excavation, solar shield tracking, win/loss checks, turn advancement, storm-card draw counts by storm level) lives here; components are mostly thin views that dispatch actions. New game behavior = new action type + handler in this file.
- **`src/App.js`** wraps everything in `DndProvider` (react-dnd HTML5 backend) and `GameStateProvider`, then lays out three columns: setup/storm/turn info (left), `GameBoard` (center), players/parts/equipment (right). `state.gameStarted` gates setup vs. in-game panels; `state.gameOver` shows `GameOverAnimation`.
- **Board** is a 5x5 grid (positions 0–24) rendered by `GameBoard`/`Tile`. Tiles, players, and parts are drag-and-drop (players move between tiles, parts drop onto tiles).
- **Static data** in `src/*.json`: `desertTiles.json` (tile ids/types: tunnel, clue with direction+part, etc.; ids map to `public/tile_images/<id>.png`), `stormCards.json`, `equipmentDeck.json`, `partInfoData.json`, `playerInfoData.json`.
- Setup phase supports freezing/unfreezing options before `START_GAME`; `decidedNoOfPlayers` and `randomStartPosition` are module-level constants in the provider.
