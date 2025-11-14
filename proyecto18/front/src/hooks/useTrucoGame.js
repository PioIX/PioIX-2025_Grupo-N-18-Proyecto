import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar la lógica del juego de Truco
 * @returns {Object} Estado y funciones del juego
 */
export function useTrucoGame() {
  // Valores de poder de las cartas
  const CARD_VALUES = {
    '1': 14,   // As - carta más alta
    '2': 9,    // Dos
    '3': 10,   // Tres
    '4': 1,    // Cuatro - carta más baja
    '5': 2,    // Cinco
    '6': 3,    // Seis
    '7': 12,   // Siete
    '10': 5,   // Sota
    '11': 6,   // Caballo
    '12': 7    // Rey
  };

  const SUITS = ['oro', 'copa', 'espada', 'basto'];
  const VALUES = ['1', '2', '3', '4', '5', '6', '7', '10', '11', '12'];

  const [gameState, setGameState] = useState({
    playerHand: [],
    opponentHand: [],
    playerScore: 0,
    opponentScore: 0,
    round: 1,
    playerPlayed: [],
    opponentPlayed: [],
    message: 'Esperando inicio del juego...',
    isPlayerTurn: false,
    playerRoundsWon: 0,
    opponentRoundsWon: 0,
    gameFinished: false
  });

  /**
   * Crear y barajar el mazo
   */
  const createDeck = useCallback(() => {
    const deck = [];
    
    SUITS.forEach(suit => {
      VALUES.forEach(value => {
        deck.push({
          suit,
          value,
          power: CARD_VALUES[value],
          id: `${suit}_${value}`
        });
      });
    });

    // Barajar usando algoritmo Fisher-Yates
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }, []);

  /**
   * Repartir cartas a ambos jugadores
   */
  const dealCards = useCallback(() => {
    const deck = createDeck();
    
    setGameState(prev => ({
      ...prev,
      playerHand: deck.slice(0, 3),
      opponentHand: deck.slice(3, 6),
      round: 1,
      playerPlayed: [],
      opponentPlayed: [],
      message: 'Nueva mano - Tu turno',
      isPlayerTurn: true,
      playerRoundsWon: 0,
      opponentRoundsWon: 0,
      gameFinished: false
    }));
  }, [createDeck]);

  /**
   * Comparar dos cartas y determinar ganador
   */
  const compareCards = useCallback((card1, card2) => {
    if (card1.power > card2.power) return 1;
    if (card2.power > card1.power) return -1;
    return 0;
  }, []);

  /**
   * Calcular puntos de envido de una mano
   */
  const calculateEnvido = useCallback((hand) => {
    // Agrupar cartas por palo
    const bySuit = {};
    hand.forEach(card => {
      if (!bySuit[card.suit]) bySuit[card.suit] = [];
      bySuit[card.suit].push(card);
    });

    let maxEnvido = 0;

    // Calcular envido para cada palo
    Object.values(bySuit).forEach(cards => {
      if (cards.length >= 2) {
        // Tomar las dos cartas más altas del mismo palo
        const sortedCards = cards
          .map(c => {
            const val = parseInt(c.value);
            return val <= 7 ? val : 0; // Figuras valen 0
          })
          .sort((a, b) => b - a);
        
        const envido = 20 + sortedCards[0] + sortedCards[1];
        maxEnvido = Math.max(maxEnvido, envido);
      } else if (cards.length === 1) {
        const val = parseInt(cards[0].value);
        const envido = val <= 7 ? val : 0;
        maxEnvido = Math.max(maxEnvido, envido);
      }
    });

    return maxEnvido;
  }, []);

  /**
   * Reiniciar el juego completo
   */
  const resetGame = useCallback(() => {
    setGameState({
      playerHand: [],
      opponentHand: [],
      playerScore: 0,
      opponentScore: 0,
      round: 1,
      playerPlayed: [],
      opponentPlayed: [],
      message: 'Juego reiniciado',
      isPlayerTurn: true,
      playerRoundsWon: 0,
      opponentRoundsWon: 0,
      gameFinished: false
    });
  }, []);

  /**
   * Actualizar mensaje del juego
   */
  const setMessage = useCallback((message) => {
    setGameState(prev => ({ ...prev, message }));
  }, []);

  /**
   * Actualizar puntuación
   */
  const updateScore = useCallback((playerPoints, opponentPoints) => {
    setGameState(prev => ({
      ...prev,
      playerScore: prev.playerScore + playerPoints,
      opponentScore: prev.opponentScore + opponentPoints
    }));
  }, []);

  return {
    gameState,
    setGameState,
    dealCards,
    createDeck,
    compareCards,
    calculateEnvido,
    resetGame,
    setMessage,
    updateScore,
    CARD_VALUES,
    SUITS,
    VALUES
  };
}

export default useTrucoGame;