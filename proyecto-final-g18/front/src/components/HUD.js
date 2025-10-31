// src/components/HUD.js
export default function HUD({ turno, marcador }) {
  return (
    <div style={{
      backgroundColor: "#022b30",
      padding: "12px",
      borderRadius: "10px",
      color: "#e6eef8",
      textAlign: "center"
    }}>
      <h3 style={{ margin: 0 }}>Turno: {turno === "jugador1" ? "Jugador 1" : "Jugador 2"}</h3>
      <p style={{ fontSize: "18px", fontWeight: "bold" }}>
        Marcador: {marcador.a} - {marcador.b}
      </p>
    </div>
  );
}
