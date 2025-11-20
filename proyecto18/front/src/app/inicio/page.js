'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function InicioPage() {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <div className={`${styles.card} animate-fadeIn`}>
        <div className={styles.header}>
          <div className={styles.icon}></div>
          <h1 className={styles.title}>Truco Argentino</h1>
          <p className={styles.subtitle}>El juego de cartas más popular de Argentina</p>
        </div>

        <div className={styles.buttons}>
          <button 
            onClick={() => router.push('/login')}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <span className={styles.btnIcon}></span>
            <span>Iniciar Sesión</span>
          </button>

          <button 
            onClick={() => router.push('/registro')}
            className={`${styles.btn} ${styles.btnSuccess}`}
          >
            <span className={styles.btnIcon}></span>
            <span>Registrarse</span>
          </button>
        </div>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}></span>
            <span>Juega vs IA o 1vs1</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}></span>
            <span>Primer jugador en llegar a 15 puntos gana</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}></span>
            <span>Partidas rápidas y emocionantes</span>
          </div>
        </div>

        <div className={styles.footer}>
          <p>2025 5B</p>
        </div>
      </div>
    </div>
  );
}