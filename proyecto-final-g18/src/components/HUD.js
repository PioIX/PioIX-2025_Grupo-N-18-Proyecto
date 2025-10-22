// src/components/HUD.js
export default function HUD({ players = [], marcador = { a: 0, b: 0 } }) {
  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Jugadores</h4>
      <ul style={{ paddingLeft: 14 }}>
        {players.map((p) => (
          <li key={p.id} style={{ marginBottom: 6 }}>
            {p.nombre || p.id} {p.ready ? " (listo)" : ""}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <strong>Marcador</strong>
        <div>{marcador.a} - {marcador.b}</div>
      </div>
    </div>
  );
}
