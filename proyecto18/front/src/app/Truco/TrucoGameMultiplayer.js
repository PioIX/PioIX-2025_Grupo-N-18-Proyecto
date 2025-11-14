'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import TrucoActions from '../components/TrucoActions';
import styles from './TrucoGame.module.css';
import multiplayerStyles from './TrucoGameMultiplayer.module.css';

export default function TrucoGameMultiplayer({ playerName, onLogout, onBackToMenu }) {
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [opponentName, setOpponentName] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);

  const [gameState, setGameState] = useState({
    playerHand: [],
    playerScore: 0,
    opponentScore: 0,
    round: 1,
    playerPlayed: [],
    opponentPlayed: [],
    message: 'Esperando conexión...',
    isPlayerTurn: false,
    playerRoundsWon: 0,
    opponentRoundsWon: 0,
    gameFinished: false
  });

  // Conectar WebSocket (cuando esté disponible el servidor)
  useEffect(() => {
    // TODO: Implementar conexión WebSocket real
    // const socket = io('http://localhost:3001');
    // socketRef.current = socket;

    // socket.on('connect', () => {
    //   console.log('Conectado al servidor');
    // });

    // socket.on('player_joined', (data) => {
    //   setOpponentName(data.opponentName);
    //   setWaitingForPlayer(false);
    //   setGameState(prev => ({ ...prev, message: 'Oponente conectado. Preparando juego...' }));
    // });

    // socket.on('game_start', (data) => {
    //   setGameState(prev => ({
    //     ...prev,
    //     playerHand: data.yourHand,
    //     isPlayerTurn: data.isYourTurn,
    //     message: data.isYourTurn ? 'Tu turno' : 'Turno del oponente'
    //   }));
    // });

    // socket.on('opponent_played', (data) => {
    //   // Manejar jugada del oponente
    // });

    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.disconnect();
    //   }
    // };
  }, []);

  const connectToRoom = () => {
    if (!roomCode) {
      setError('Ingresa un código de sala');
      return;
    }

    if (roomCode.length < 4) {
      setError('El código debe tener al menos 4 caracteres');
      return;
    }

    setError('');
    setIsConnected(true);
    setWaitingForPlayer(true);

    // TODO: Implementar con WebSocket
    // socketRef.current.emit('join_room', { 
    //   roomCode, 
    //   playerName 
    // });
  };

  const createRoom = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(newRoomCode);
    setIsConnected(true);
    setWaitingForPlayer(true);
    setError('');

    // TODO: Implementar con WebSocket
    // socketRef.current.emit('create_room', { 
    //   roomCode: newRoomCode, 
    //   playerName 
    // });
  };

  const handlePlayCard = (cardIndex) => {
    if (!gameState.isPlayerTurn || gameState.gameFinished) return;

    const card = gameState.playerHand[cardIndex];
    
    // TODO: Enviar jugada al servidor
    // socketRef.current.emit('play_card', { card, roomCode });

    const newPlayerHand = gameState.playerHand.filter((_, i) => i !== cardIndex);
    const newPlayerPlayed = [...gameState.playerPlayed, card];

    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      playerPlayed: newPlayerPlayed,
      isPlayerTurn: false,
      message: 'Esperando jugada del oponente...'
    }));
  };

  const handleTruco = () => {
    // TODO: Enviar acción Truco al servidor
    // socketRef.current.emit('action', { type: 'truco', roomCode });
    setGameState(prev => ({
      ...prev,
      message: 'Cantaste Truco! Esperando respuesta...'
    }));
  };

  const handleEnvido = () => {
    // TODO: Enviar acción Envido al servidor
    // socketRef.current.emit('action', { type: 'envido', roomCode });
    setGameState(prev => ({
      ...prev,
      message: 'Cantaste Envido! Esperando respuesta...'
    }));
  };

  const handleFold = () => {
    // TODO: Enviar rendición al servidor
    // socketRef.current.emit('action', { type: 'fold', roomCode });
    setGameState(prev => ({
      ...prev,
      message: 'Te fuiste al mazo'
    }));
  };

  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setIsConnected(false);
    setWaitingForPlayer(false);
    setRoomCode('');
    onBackToMenu();
  };

  // Pantalla de conexión
  if (!isConnected) {
    return (
      <div className={multiplayerStyles.connectionContainer}>
        <div className={multiplayerStyles.connectionCard}>
          <div className={multiplayerStyles.connectionHeader}>
            <div className={multiplayerStyles.connectionIcon}>👥</div>
            <h2 className={multiplayerStyles.connectionTitle}>Juego Multijugador</h2>
            <p className={multiplayerStyles.connectionSubtitle}>Conectate con otro jugador</p>
          </div>

          <div className={multiplayerStyles.connectionOptions}>
            <button
              onClick={createRoom}
              className={`${multiplayerStyles.connectionBtn} ${multiplayerStyles.btnCreate}`}
            >
              <span className={multiplayerStyles.btnIcon}>🎮</span>
              Crear Sala Nueva
            </button>

            <div className={multiplayerStyles.divider}>o</div>

            <div className={multiplayerStyles.joinSection}>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO DE SALA"
                className={multiplayerStyles.roomInput}
                maxLength={8}
              />
              <button
                onClick={connectToRoom}
                className={`${multiplayerStyles.connectionBtn} ${multiplayerStyles.btnJoin}`}
              >
                <span className={multiplayerStyles.btnIcon}>🚪</span>
                Unirse a Sala
              </button>
            </div>

            {error && (
              <div className={multiplayerStyles.error}>
                {error}
              </div>
            )}
          </div>

          <button
            onClick={onBackToMenu}
            className={multiplayerStyles.btnBack}
          >
            ← Volver al menú
          </button>

          <div className={multiplayerStyles.warning}>
            <p className={multiplayerStyles.warningIcon}>⚠️</p>
            <p className={multiplayerStyles.warningText}>
              Modo multijugador requiere conexión al servidor WebSocket
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de espera
  if (waitingForPlayer) {
    return (
      <div className={multiplayerStyles.waitingContainer}>
        <div className={multiplayerStyles.waitingCard}>
          <div className={multiplayerStyles.waitingIcon}>⏳</div>
          <h2 className={multiplayerStyles.waitingTitle}>Esperando oponente...</h2>
          <div className={multiplayerStyles.roomCodeBox}>
            <p className={multiplayerStyles.roomCodeLabel}>Código de sala:</p>
            <p className={multiplayerStyles.roomCodeValue}>{roomCode}</p>
          </div>
          <p className={multiplayerStyles.waitingText}>
            Comparte este código con tu oponente
          </p>
          <button
            onClick={handleDisconnect}
            className={multiplayerStyles.btnCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de juego (similar a TrucoGame.js pero con oponente real)
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>👥</div>
            <div>
              <h1 className={styles.headerTitle}>Truco 1vs1</h1>
              <p className={styles.headerSubtitle}>
                {playerName} vs {opponentName || 'Oponente'}
              </p>
              <p className={styles.headerSubtitle}>Sala: {roomCode}</p>
            </div>
          </div>
          <div className={styles.headerButtons}>
            <button onClick={handleDisconnect} className={styles.btnLogout}>
              Desconectar
            </button>
          </div>
        </div>
      </div>

      <div className={styles.gameContainer}>
        <div className={styles.scoreBoard}>
          <div className={styles.scoreCard}>
            <p className={styles.scoreLabel}>Tú</p>
            <p className={styles.scoreValue}>{gameState.playerScore}</p>
            <p className={styles.scoreRounds}>Rondas: {gameState.playerRoundsWon}</p>
          </div>
          <div className={`${styles.scoreCard} ${styles.scoreCardIA}`}>
            <p className={styles.scoreLabel}>{opponentName || 'Oponente'}</p>
            <p className={styles.scoreValue}>{gameState.opponentScore}</p>
            <p className={styles.scoreRounds}>Rondas: {gameState.opponentRoundsWon}</p>
          </div>
        </div>

        <div className={styles.messageBox}>
          <p className={styles.messageText}>{gameState.message}</p>
          <p className={styles.messageRound}>Ronda {gameState.round}/3</p>
        </div>

        <div className={styles.opponentSection}>
          <p className={styles.sectionLabel}>Cartas de {opponentName || 'Oponente'}</p>
          <div className={styles.cardContainer}>
            {[1, 2, 3].map((_, idx) => (
              <Card key={idx} showBack={true} />
            ))}
          </div>
        </div>

        <div className={styles.table}>
          <p className={styles.tableLabel}>Mesa</p>
          <div className={styles.tableGrid}>
            <div className={styles.tableSection}>
              <p className={styles.tableSectionLabel}>{opponentName || 'Oponente'}</p>
              <div className={styles.tableCards}>
                {gameState.opponentPlayed.map((card, idx) => (
                  <Card key={idx} card={card} isPlayable={false} isSmall />
                ))}
              </div>
            </div>
            <div className={styles.tableSection}>
              <p className={styles.tableSectionLabel}>Tú</p>
              <div className={styles.tableCards}>
                {gameState.playerPlayed.map((card, idx) => (
                  <Card key={idx} card={card} isPlayable={false} isSmall />
                ))}
              </div>
            </div>
          </div>
        </div>

        {!gameState.gameFinished && (
          <div className={styles.actionsSection}>
            <TrucoActions
              onTruco={handleTruco}
              onEnvido={handleEnvido}
              onFold={handleFold}
              canTruco={gameState.round === 1}
              canEnvido={gameState.round === 1}
              disabled={!gameState.isPlayerTurn}
            />
          </div>
        )}

        <div className={styles.playerSection}>
          <p className={styles.sectionLabel}>Tus cartas</p>
          <div className={styles.cardContainer}>
            {gameState.playerHand.map((card, idx) => (
              <Card
                key={idx}
                card={card}
                onClick={() => handlePlayCard(idx)}
                isPlayable={gameState.isPlayerTurn && !gameState.gameFinished}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}