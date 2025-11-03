"use client";
import { useEffect, useState } from "react";
import Carta from "@/components/Carta";
import Mesa from "@/components/Mesa";
import HUD from "@/components/HUD";

export default function Juego({ room, socket, players }) {
  const [cartas, setCartas] = useState([]);
  const [jugadas, setJugadas] = useState([]);
  const [turno, setTurno] = useState("jugador1");
  const [marcador, setMarcador] = useState({ a: 0, b: 0 });

  useEffect(() => {
    if (!socket) return;

    socket.on("deal", (data) => setCartas(data.cartas));
    socket.on("playCard", (data) => setJugadas((prev) => [...prev, data]));
    socket.on("updateScore", (data) => setMarcador(data));

    return () => {
      socket.off("deal");
      socket.off("playCard");
      socket.off("updateScore");
    };
  }, [socket]);

  const jugarCarta = (carta) => {
    socket.emit("playCard", { carta, room });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <HUD turno={turno} marcador={marcador} />

      <div style={{ margin: "20px 0" }}>
        <h3>Tus cartas</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {cartas.map((carta) => (
            <Carta key={carta.id} carta={carta} onClick={() => jugarCarta(carta)} />
          ))}
        </div>
      </div>

      <Mesa jugadas={jugadas} />
    </div>
  );
}
