// src/components/Mesa.js
export default function Mesa({ jugadas = [] }) {
  return (
    <div>
      <div style={{ marginBottom: 8, color: "#9fb0c8" }}>
        Historial de jugadas (últimas)
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {jugadas.length === 0 && <div style={{ color: "#b0c6cf" }}>Aún no hay jugadas</div>}
        {jugadas.map((j, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            background: "#022b30",
            padding: 8,
            borderRadius: 6
          }}>
            <div>
              <strong>Ronda {i + 1}</strong>
              <div style={{ fontSize: 13 }}>{j.local ? j.local.nombre : "—"}</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#9fb0c8" }}>vs</div>
              <div style={{ fontSize: 13 }}>{j.rival ? j.rival.nombre : "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
