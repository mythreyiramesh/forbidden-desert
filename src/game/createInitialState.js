// src/game/createInitialState.js
import stormCardsData from '../stormCards.json';
import initialEquipment from '../equipmentDeck.json';
import playerInfo from '../playerInfoData.json';
import partInfo from '../partInfoData.json';
import { shuffleArray, getRandomInt, getCardsToDraw } from './rules';

export const DEFAULT_NO_OF_PLAYERS = 6;

// Builds a fresh, randomised game. Call once per new game.
export function createInitialState(noOfPlayers = DEFAULT_NO_OF_PLAYERS) {
  const randomStartPosition = getRandomInt(0, 24);
  return {
    isFrozen: false,
    gameStarted: false,
    noOfPlayers,
    gameOver: false,
    gameResult: null,
    tiles: (() => {
      // Create and shuffle desertIDs
      const desertIDs = Array.from({ length: 24 }, (_, i) => i + 1);
      for (let i = desertIDs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [desertIDs[i], desertIDs[j]] = [desertIDs[j], desertIDs[i]];
      }

      let desertIDIndex = 0;

      return Array(25).fill(null).map((_, index) => {
        const baseTile = {
          id: index,
          type: index === 12 ? 'storm' : 'normal', // Center tile (index 12) is the storm
          sandLevel: 0,
          excavated: false,
        };

        const indicesToModify = [2, 6, 8, 10, 14, 16, 18, 22];
        const sandLevelToSet = 1; // You can adjust this value as needed

        if (indicesToModify.includes(index)) {
          baseTile.sandLevel = sandLevelToSet;
        }

        // Add desertID only to normal tiles
        if (baseTile.type === 'normal') {
          baseTile.desertID = desertIDs[desertIDIndex++];
        }
        return baseTile;
      });
    })(),
    crashTilePosition: null,
    tunnelTilePositions: [],
    excavatedTunnelTiles: [],
    players: playerInfo.map(player => ({
      ...player,
      position: randomStartPosition,
      water: player.maxWater,
    })),
    orderedPlayerIndices: [],
    currentPlayer: null,
    cardsDrawnInTurn: null,
    parts: partInfo,
    stormLevel: 1,
    cardsToDraw: getCardsToDraw(1, noOfPlayers),
    sandPile: 40,
    stormPosition: 12, // We can keep this for easier tracking
    stormDeck: shuffleArray([...stormCardsData.stormCards]), // coming from the JSON
    stormDiscard: [],
    lastDrawnCard: null,
    revealedCards: [],
    equipmentIds: shuffleArray(initialEquipment.map(eq => eq.id)),
    equipment: initialEquipment,
    assignedEquipmentCount: 0,
    peekedTileIds: [],
    terrascopeInUse: null,
    solarShieldActive: false,
    solarShieldTiles: [],
  };
}
