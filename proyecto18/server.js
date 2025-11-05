// server.js (en la raíz del proyecto, fuera de /front)
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Almacenar juegos activos
const games = new Map();

// Mazo de cartas del truco
const createDeck = () => {
  const suits = ['espadas', 'bastos', 'oros', 'copas'];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  const deck = [];
  
  for (const suit of suits) {
    for (const number of numbers) {
      deck.push({ number, suit });
    }
  }
  
  return deck;
};

// Mezclar cartas
const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Repartir cartas
const dealCards = (deck) => {
  const player1Hand = deck.slice(0, 3);
  const player2Hand = deck.slice(3, 6);
  return { player1Hand, player2Hand };
};

// Valor de las cartas para el truco
const getCardValue = (card) => {
  const { number, suit } = card;
  
  // Cartas especiales
  if (number === 1 && suit === 'espadas') return 14; // Ancho de espadas
  if (number === 1 && suit === 'bastos') return 13; // Ancho de bastos
  if (number === 7 && suit === 'espadas') return 12; // Siete de espadas
  if (number === 7 && suit === 'oros') return 11; // Siete de oros
  
  // Treses
  if (number === 3) return 10;
  
  // Doses
  if (number === 2) return 9;
  
  // Anchos restantes
  if (number === 1) return 8;
  
  // Rey, Caballo, Sota
  if (number === 12) return 7;
  if (number === 11) return 6;
  if (number === 10) return 5;
  
  // Sietes restantes
  if (number === 7) return 4;
  
  // Seis, cinco, cuatro
  if (number === 6) return 3;
  if (number === 5) return 2;
  if (number === 4) return 1;
  
  return 0;
};

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('createGame', () => {
    const gameId = Math.random().toString(36).substring(7);
    games.set(gameId, {
      id: gameId,
      players: [socket.id],
      hands: {},
      currentPlayer: null,
      table: [],
      scores: {},
      round: 0,
      pointsAtStake: 1,
      pendingChallenge: null
    });
    
    socket.join(gameId);
    socket.emit('gameCreated', { gameId });
    console.log('Juego creado:', gameId);
  });

  socket.on('joinGame', ({ gameId }) => {
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Juego no encontrado' });
      return;
    }
    
    if (game.players.length >= 2) {
      socket.emit('error', { message: 'El juego está lleno' });
      return;
    }
    
    game.players.push(socket.id);
    socket.join(gameId);
    
    // Iniciar el juego
    const deck = shuffleDeck(createDeck());
    const { player1Hand, player2Hand } = dealCards(deck);
    
    game.hands[game.players[0]] = player1Hand;
    game.hands[game.players[1]] = player2Hand;
    game.currentPlayer = game.players[0];
    game.scores[game.players[0]] = 0;
    game.scores[game.players[1]] = 0;
    
    // Enviar datos iniciales a ambos jugadores
    io.to(game.players[0]).emit('gameStart', {
      hand: player1Hand,
      gameState: {
        players: game.players,
        currentPlayer: game.currentPlayer,
        scores: game.scores,
        table: game.table
      }
    });
    
    io.to(game.players[1]).emit('gameStart', {
      hand: player2Hand,
      gameState: {
        players: game.players,
        currentPlayer: game.currentPlayer,
        scores: game.scores,
        table: game.table
      }
    });
    
    io.to(gameId).emit('gameJoined', { gameId });
    console.log('Jugador unido al juego:', gameId);
  });

  socket.on('playCard', ({ gameId, cardIndex, card }) => {
    const game = games.get(gameId);
    
    if (!game || game.currentPlayer !== socket.id) {
      return;
    }
    
    // Agregar carta a la mesa
    game.table.push({ ...card, player: socket.id });
    
    // Cambiar turno
    const currentIndex = game.players.indexOf(socket.id);
    game.currentPlayer = game.players[(currentIndex + 1) % 2];
    
    // Verificar si la ronda terminó (ambos jugadores jugaron)
    if (game.table.length === 2) {
      // Determinar ganador de la mano
      const card1 = game.table[0];
      const card2 = game.table[1];
      
      const value1 = getCardValue(card1);
      const value2 = getCardValue(card2);
      
      let winner;
      if (value1 > value2) {
        winner = card1.player;
      } else if (value2 > value1) {
        winner = card2.player;
      } else {
        // Empate - gana el mano
        winner = game.players[0];
      }
      
      // Sumar puntos
      game.scores[winner] += game.pointsAtStake;
      
      // Verificar si alguien ganó el juego
      if (game.scores[winner] >= 15) {
        io.to(gameId).emit('gameEnd', {
          winner,
          finalScore: game.scores
        });
        games.delete(gameId);
        return;
      }
      
      // Nueva ronda
      setTimeout(() => {
        game.table = [];
        game.pointsAtStake = 1;
        game.pendingChallenge = null;
        
        const deck = shuffleDeck(createDeck());
        const { player1Hand, player2Hand } = dealCards(deck);
        
        game.hands[game.players[0]] = player1Hand;
        game.hands[game.players[1]] = player2Hand;
        
        io.to(game.players[0]).emit('gameUpdate', {
          hand: player1Hand,
          gameState: {
            players: game.players,
            currentPlayer: game.currentPlayer,
            scores: game.scores,
            table: game.table
          }
        });
        
        io.to(game.players[1]).emit('gameUpdate', {
          hand: player2Hand,
          gameState: {
            players: game.players,
            currentPlayer: game.currentPlayer,
            scores: game.scores,
            table: game.table
          }
        });
      }, 2000);
    } else {
      // Actualizar estado del juego
      io.to(gameId).emit('gameUpdate', {
        gameState: {
          players: game.players,
          currentPlayer: game.currentPlayer,
          scores: game.scores,
          table: game.table
        }
      });
    }
  });

  socket.on('trucoAction', ({ gameId, action }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    const actionPoints = {
      'envido': 2,
      'realEnvido': 3,
      'faltaEnvido': 15,
      'truco': 2,
      'retruco': 3,
      'vale4': 4
    };
    
    game.pendingChallenge = action;
    game.pointsAtStake = actionPoints[action] || 1;
    
    // Notificar al oponente
    const opponent = game.players.find(p => p !== socket.id);
    io.to(opponent).emit('gameUpdate', {
      gameState: {
        players: game.players,
        currentPlayer: game.currentPlayer,
        scores: game.scores,
        table: game.table,
        pendingChallenge: action
      }
    });
    
    io.to(gameId).emit('trucoResponse', { action, points: game.pointsAtStake });
  });

  socket.on('trucoResponse', ({ gameId, accepted }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    if (!accepted) {
      // El oponente rechazó, el que cantó gana los puntos base
      const opponent = game.players.find(p => p !== socket.id);
      game.scores[opponent] += 1;
      
      if (game.scores[opponent] >= 15) {
        io.to(gameId).emit('gameEnd', {
          winner: opponent,
          finalScore: game.scores
        });
        games.delete(gameId);
        return;
      }
      
      // Nueva ronda
      game.table = [];
      game.pointsAtStake = 1;
      game.pendingChallenge = null;
    } else {
      // Aceptó el desafío
      game.pendingChallenge = null;
    }
    
    io.to(gameId).emit('gameUpdate', {
      gameState: {
        players: game.players,
        currentPlayer: game.currentPlayer,
        scores: game.scores,
        table: game.table,
        pendingChallenge: game.pendingChallenge
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    // Limpiar juegos donde estaba el jugador
    for (const [gameId, game] of games.entries()) {
      if (game.players.includes(socket.id)) {
        io.to(gameId).emit('error', { message: 'El oponente se desconectó' });
        games.delete(gameId);
      }
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🃏 Servidor de Truco corriendo en http://localhost:${PORT}`);
});