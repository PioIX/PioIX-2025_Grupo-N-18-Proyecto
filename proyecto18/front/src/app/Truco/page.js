'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TrucoGame from './TrucoGame';
import TrucoGameMultiplayer from './TrucoGameMultiplayer';

export default function TrucoPage() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState(null); // null, 'ia', 'multiplayer'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Verificar si hay usuario logueado
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/');
    } else {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleBackToMenu = () => {
    setGameMode(null);
  };

  if (!currentUser) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Renderizar juego vs IA
  if (gameMode === 'ia') {
    return (
      <TrucoGameIA 
        playerName={currentUser.username} 
        onLogout={handleLogout}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Renderizar juego multijugador
  if (gameMode === 'multiplayer') {
    return (
      <TrucoGameMultiplayer 
        playerName={currentUser.username} 
        onLogout={handleLogout}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Selector de modo
  return (
    <div className={styles.container}>
      <div className={styles.selectorCard}>
        <div className={styles.header}>
          <div className={styles.trophy}>🏆</div>
          <h1 className={styles.title}>Elige un Modo</h1>
          <p className={styles.welcome}>Bienvenido, {currentUser.username}</p>
        </div>

        <div className={styles.modeGrid}>
          {/* Modo vs IA */}
          <button 
            onClick={() => setGameMode('ia')}
            className={`${styles.modeCard} ${styles.modeIA}`}
          >
            <div className={styles.modeIcon}>🤖</div>
            <h3 className={styles.modeTitle}>vs IA</h3>
            <p className={styles.modeDesc}>Practica contra la computadora</p>
          </button>

          {/* Modo 1vs1 */}
          <button 
            onClick={() => setGameMode('multiplayer')}
            className={`${styles.modeCard} ${styles.modeMultiplayer}`}
          >
            <div className={styles.modeIcon}>👥</div>
            <h3 className={styles.modeTitle}>1 vs 1</h3>
            <p className={styles.modeDesc}>Juega contra otro jugador</p>
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className={styles.logoutBtn}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}