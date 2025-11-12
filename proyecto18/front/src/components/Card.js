import styles from './Card.module.css';

export default function Card({ card, onClick, isPlayable = true, isSmall = false, showBack = false }) {
  
  // Mostrar reverso de la carta
  if (showBack) {
    return (
      <div className={`${styles.card} ${isSmall ? styles.cardSmall : ''} ${styles.cardBack}`}>
        <div className={styles.backPattern}>🂠</div>
      </div>
    );
  }

  // Validación
  if (!card) return null;

  // Ruta de la imagen desde public/images/cartas/
  // Formato esperado: oro_1.png, copa_7.png, espada_12.png, basto_10.png
  const imagePath = `/images/cartas/${card.suit}_${card.value}.png`;

  // Fallback de emojis si no hay imagen
  const suitEmojis = {
    'oro': '🟡',
    'copa': '🔴',
    'espada': '⚔️',
    'basto': '🟢'
  };

  const suitColors = {
    'oro': styles.oro,
    'copa': styles.copa,
    'espada': styles.espada,
    'basto': styles.basto
  };

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        ${styles.card}
        ${isSmall ? styles.cardSmall : ''}
        ${isPlayable ? styles.cardPlayable : styles.cardDisabled}
        ${suitColors[card.suit] || ''}
      `}
    >
      <img 
        src={imagePath} 
        alt={`${card.value} de ${card.suit}`}
        className={styles.cardImage}
        onError={(e) => {
          // Si la imagen no existe, mostrar fallback con emojis
          e.target.style.display = 'none';
          const fallback = e.target.nextElementSibling;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      
      {/* Fallback si no hay imagen */}
      <div className={styles.cardFallback} style={{ display: 'none' }}>
        <div className={styles.fallbackSuit}>
          {suitEmojis[card.suit]}
        </div>
        <div className={styles.fallbackValue}>
          {card.value}
        </div>
      </div>
    </div>
  );
}