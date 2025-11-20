// src/components/TrucoGame.js
'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Card from '../../components/Card';
import TrucoActions from '../../components/TrucoActions';
import styles from '../../styles/game.module.css';

export default function TrucoGame() {
  const [socket, setSocket] = useState(null);
  const [gameId, setGameId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [myHand, setMyHand] = useState([]);
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Conectar al servidor WebSocket
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Conectado al servidor');
      setPlayerId(newSocket.id);
    });

    newSocket.on('gameCreated', ({ gameId }) => {
      setGameId(gameId);
      setMessage(`Sala creada: ${gameId}. Esperando al oponente...`);
    });

    newSocket.on('gameJoined', ({ gameId }) => {
      setGameId(gameId);
      setWaitingForPlayer(false);
      setMessage('¡Oponente conectado! Preparando el juego...');
    });

    newSocket.on('gameStart', ({ hand, gameState: state }) => {
      setMyHand(hand);
      setGameState(state);
      setWaitingForPlayer(false);
      setMessage(state.currentPlayer === playerId ? '¡Tu turno!' : 'Turno del oponente');
    });

    newSocket.on('gameUpdate', ({ gameState: state, hand }) => {
      setGameState(state);
      if (hand) setMyHand(hand);
      setMessage(state.currentPlayer === playerId ? '¡Tu turno!' : 'Turno del oponente');
    });

    newSocket.on('trucoResponse', ({ action, points }) => {
      setMessage(`¡${action}! - ${points} puntos en juego`);
    });

    newSocket.on('gameEnd', ({ winner, finalScore }) => {
      setMessage(`¡Juego terminado! Ganador: ${winner === playerId ? 'TÚ' : 'Oponente'}`);
    });

    newSocket.on('error', ({ message: errorMsg }) => {
      setMessage(`Error: ${errorMsg}`);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [playerId]);

  const createGame = () => {
    if (socket) {
      socket.emit('createGame');
    }
  };

  const joinGame = () => {
    const roomId = prompt('Ingresa el código de la sala:');
    if (socket && roomId) {
      socket.emit('joinGame', { gameId: roomId });
    }
  };

  const playCard = (cardIndex) => {
    if (socket && gameState?.currentPlayer === playerId) {
      const card = myHand[cardIndex];
      socket.emit('playCard', { gameId, cardIndex, card });
      
      // Remover carta de la mano localmente
      setMyHand(prev => prev.filter((_, i) => i !== cardIndex));
    }
  };

  const handleTrucoAction = (action) => {
    if (socket) {
      socket.emit('trucoAction', { gameId, action });
    }
  };

  const handleTrucoResponse = (accepted) => {
    if (socket) {
      socket.emit('trucoResponse', { gameId, accepted });
    }
  };

  if (!socket) {
    return <div className={styles.loading}>Conectando al servidor...</div>;
  }

  if (!gameId) {
    return (
      <div className={styles.lobby}>
        <h1>🃏 Truco Argentino</h1>
        <div className={styles.lobbyButtons}>
          <button onClick={createGame} className={styles.btnPrimary}>
            Crear Partida
          </button>
          <button onClick={joinGame} className={styles.btnSecondary}>
            Unirse a Partida
          </button>
        </div>
      </div>
    );
  }

  if (waitingForPlayer) {
    return (
      <div className={styles.waiting}>
        <h2>Esperando oponente...</h2>
        <p className={styles.gameCode}>Código de sala: <strong>{gameId}</strong></p>
        <p className={styles.instruction}>Comparte este código con tu oponente</p>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <div className={styles.scoreBoard}>
          <div className={styles.score}>
            <span>Tú: {gameState?.scores?.[playerId] || 0}</span>
          </div>
          <div className={styles.score}>
            <span>Oponente: {gameState?.scores?.[gameState?.players?.find(p => p !== playerId)] || 0}</span>
          </div>
        </div>
        <p className={styles.message}>{message}</p>
      </div>

      <div className={styles.gameBoard}>
        {/* Cartas del oponente (boca abajo) */}
        <div className={styles.opponentHand}>
          <h3>Oponente</h3>
          <div className={styles.cards}>
            {[1, 2, 3].map((_, i) => (
              <Card key={i} card={null} faceDown />
            ))}
          </div>
        </div>

        {/* Mesa */}
        <div className={styles.table}>
          <h3>Mesa</h3>
          <div className={styles.playedCards}>
            {gameState?.table?.map((card, i) => (
              <Card key={i} card={card} />
            ))}
          </div>
        </div>

        {/* Tu mano */}
        <div className={styles.playerHand}>
          <h3>Tu mano</h3>
          <div className={styles.cards}>
            {myHand.map((card, i) => (
              <Card 
                key={i} 
                card={card} 
                onClick={() => playCard(i)}
                disabled={gameState?.currentPlayer !== playerId}
              />
            ))}
          </div>
        </div>
      </div>

      <TrucoActions 
        onAction={handleTrucoAction}
        onResponse={handleTrucoResponse}
        disabled={gameState?.currentPlayer !== playerId}
        pendingChallenge={gameState?.pendingChallenge}
      />
    </div>
  );
}