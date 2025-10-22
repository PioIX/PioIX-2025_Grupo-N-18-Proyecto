"use client";
// src/app/juego/Juego.js
import { useEffect, useState, useMemo } from "react";
import clsx from "clsx";
import Carta from "@/components/Carta";
import Mesa from "@/components/Mesa";
import HUD from "@/components/HUD";

/**
 * Juego component:
 * - Maneja la mano local y la mano rival (visibilidad parcial)
 * - Envía playCard al servidor cuando el jugador selecciona una carta
 * - Escucha eventos para sincronizar estado
 *
 * Eventos usados (frontend <-> backend que luego crearás):
 * - 'deal' -> { manoLocal, manoRivalCount, turno, puntos: {a,b} }
 * - 'turn:update' -> { turno }
 * - 'play:accepted' -> confirma quese jugó la carta y envía jugada completa
 * - 'round:result' -> { ganadorRonda, cartas, marcador }
 * - 'game:end' -> { ganadorFinal, marcadorFinal }
 *
 * El servidor debe controlar la lógica del Truco (reparto, turno, comparar cartas, puntos).
 */
export default function Juego({ room, socket, players }) {
  const [manoLocal, setManoLocal] = useState([]);      // cartas del jugador local (objetos)
  const [manoRivalCount, setManoRivalCount] = useState(3); // cuántas cartas le quedan al rival (no vemos sus cartas)
  const [mesa, setMesa] = useState([]);                // historial de jugadas actuales [{local, rival}]
  const [turno, setTurno] = useState(null);            // id del jugador que tiene el turno
  const [miId, setMiId] = useState(null);
  const [marcador, setMarcador] = useState({ a: 0, b: 0 });
  const [mensaje, setMensaje] = useState("");

  // identificar al socket.id como miId
  useEffect(() => {
    if (!socket) return;
    setMiId(socket.id);
  }, [socket]);

  // escuchar eventos de juego
  useEffect(() => {
    if (!socket) return;

    socket.on("deal", (data) => {
      setManoLocal(data.manoLocal || []);
      setManoRivalCount(data.manoRivalCount ?? 3);
      setTurno(data.turno);
      setMarcador(data.marcador || { a: 0, b: 0 });
      setMesa([]);
      setMensaje("Se repartieron las cartas");
    });

    socket.on("turn:update", (data) => {
      setTurno(data.turno);
      setMensaje(data.msg || "");
    });

    socket.on("play:accepted", (data) => {
      // actualizar mesa con la jugada aceptada
      setMesa((m) => [...m, data.jugada]);
      setManoLocal((prev) => prev.filter((c) => c.id !== data.jugada.local?.id));
      setManoRivalCount((c) => c - (data.jugada.rival ? 1 : 0));
      setMensaje("Jugada registrada");
    });

    socket.on("round:result", (data) => {
      setMarcador(data.marcador);
      setMensaje(data.msg || `Ganó la ronda: ${data.ganadorRonda}`);
      // limpiar mesa tras cierto tiempo
      setTimeout(() => setMesa([]), 1500);
    });

    socket.on("game:end", (data) => {
      setMensaje(`Fin del juego: ${data.ganadorFinal}`);
    });

    socket.on("error:game", (data) => {
      setMensaje(data.msg || "Error de juego");
    });

    return () => {
      socket.off("deal");
      socket.off("turn:update");
      socket.off("play:accepted");
      socket.off("round:result");
      socket.off("game:end");
      socket.off("error:game");
    };
  }, [socket]);

  // acción: jugar una carta (clic en Carta)
  function jugarCarta(carta) {
    if (!turno) return setMensaje("Aguardá el inicio del turno.");
    if (turno !== socket.id) return setMensaje("No es tu turno.");
    // emitimos al servidor para que valide y distribuya al otro cliente
    socket.emit("playCard", { room, carta });
    setMensaje("Enviando jugada...");
  }

  // pedir repartir (solo si hay menos de 2 jugadores o para reiniciar)
  function pedirReparto() {
    socket.emit("requestDeal", { room });
  }

  const manoJSX = manoLocal.map((c) => (
    <Carta key={c.id} carta={c} onClick={() => jugarCarta(c)} disabled={turno !== socket.id} />
  ));

  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ width: 360, background: "#07202a", padding: 14, borderRadius: 8 }}>
        <h3>Sala: {room}</h3>
        <p style={{ color: "#9fb0c8" }}>Vos: {socket.id === miId ? "Tú" : "Jugador"}</p>
        <div style={{ marginTop: 8 }}>
          <strong>Marcador:</strong> {marcador.a} - {marcador.b}
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Turno:</strong> {turno === socket.id ? "Tu turno" : "Turno rival"}
        </div>

        <hr style={{ borderColor: "#12343a", margin: "10px 0" }} />

        <div>
          <strong>Tu mano:</strong>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {manoLocal.length ? manoJSX : <div>No tenés cartas</div>}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Cartas rival (ocultas):</strong>
          <div>{manoRivalCount} cartas</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={pedirReparto} style={{
            marginTop: 8,
            background: "#2dd4bf",
            color: "#021014",
            padding: "8px 10px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}>
            Pedir reparto
          </button>
        </div>

        <div style={{ marginTop: 12, color: "#bcd" }}>
          <small>{mensaje}</small>
        </div>
      </div>

      <div style={{ width: 560, background: "#05202a", padding: 14, borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Mesa</h3>
        <Mesa jugadas={mesa} />
      </div>

      <div style={{ width: 240, background: "#021b20", padding: 14, borderRadius: 8 }}>
        <HUD players={players} marcador={marcador} />
      </div>
    </div>
  );
}
