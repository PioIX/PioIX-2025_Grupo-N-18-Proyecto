// src/components/Carta.js
export default function Carta({ carta, onClick }) {
  return (
    <div className="carta" onClick={onClick}>
      <h4>{carta.nombre}</h4>
      <p>{carta.valor}</p>
    </div>
  );
}
