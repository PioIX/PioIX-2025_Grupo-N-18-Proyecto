// src/components/Carta.js
import clsx from "clsx";

export default function Carta({ carta, onClick, disabled }) {
  // carta: { id, nombre, valor, palo }
  return (
    <div
      onClick={() => !disabled && onClick?.(carta)}
      className={clsx("carta", { disabled })}
      style={{
        width: 90,
        height: 120,
        borderRadius: 8,
        background: "#fff",
        color: "#021014",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: "0 6px 12px rgba(0,0,0,0.35)"
      }}
    >
      <div style={{ fontSize: 12 }}>{carta.palo || ""}</div>
      <div style={{ fontSize: 18, fontWeight: "700", textAlign: "center" }}>{carta.nombre}</div>
      <div style={{ fontSize: 12, textAlign: "right" }}>v:{carta.valor}</div>
    </div>
  );
}
