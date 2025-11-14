import styles from './TrucoActions.module.css';

export default function TrucoActions({ 
  onTruco, 
  onEnvido, 
  onFold, 
  canTruco = true, 
  canEnvido = true, 
  disabled = false 
}) {
  return (
    <div className={styles.actionsContainer}>
      {canEnvido && (
        <button
          onClick={onEnvido}
          disabled={disabled}
          className={`${styles.actionBtn} ${styles.btnEnvido}`}
          title="Cantar Envido"
        >
          <span className={styles.btnIcon}>💙</span>
          <span className={styles.btnText}>Envido</span>
        </button>
      )}

      {canTruco && (
        <button
          onClick={onTruco}
          disabled={disabled}
          className={`${styles.actionBtn} ${styles.btnTruco}`}
          title="Cantar Truco"
        >
          <span className={styles.btnIcon}>⚡</span>
          <span className={styles.btnText}>Truco</span>
        </button>
      )}

      <button
        onClick={onFold}
        disabled={disabled}
        className={`${styles.actionBtn} ${styles.btnFold}`}
        title="Abandonar la mano"
      >
        <span className={styles.btnIcon}>🏳️</span>
        <span className={styles.btnText}>Me voy al mazo</span>
      </button>
    </div>
  );
}