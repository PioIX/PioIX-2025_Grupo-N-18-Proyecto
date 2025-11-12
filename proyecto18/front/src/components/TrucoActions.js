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
        >
          <span className={styles.btnIcon}>💙</span>
          Envido
        </button>
      )}

      {canTruco && (
        <button
          onClick={onTruco}
          disabled={disabled}
          className={`${styles.actionBtn} ${styles.btnTruco}`}
        >
          <span className={styles.btnIcon}>⚡</span>
          Truco
        </button>
      )}

      <button
        onClick={onFold}
        disabled={disabled}
        className={`${styles.actionBtn} ${styles.btnFold}`}
      >
        <span className={styles.btnIcon}>🏳️</span>
        Me voy al mazo
      </button>
    </div>
  );
}