"use client";
// src/app/juego/page.js
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSocket from "@/hooks/useSocket";
import Juego from "./Juego";
import "@/app/globals.css";

export default function JuegoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const room = searchParams.get("room");
  const { socket, isConnected } = useSocket();
  const [ready, setReady] = useState(false);
  const [players, setPlayers] = useState([]); // lista de {id, nombre}

  useEffect(() => {
    if (!socket || !room) return;
    socket.emit("joinRoom", { room });
  }, [socket, room]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room:players", (data) => {
      setPlayers(data.players || []);
    });

    socket.on("room:ready", (data) => {
      setReady(data.ready || false);
    });

    socket.on("room:full", () => {
      alert("La sala ya tiene 2 jugadores");
      router.push("/");
    });

    return () => {
      socket.off("room:players");
      socket.off("room:ready");
      socket.off("room:full");
    };
  }, [socket, router]);

  if (!room) return <h2>Falta el código de sala en la URL.</h2>;
  if (!isConnected) return <h2>Conectando al servidor...</h2>;

  if (!ready) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <h2>Sala: {room}</h2>
        <p>Jugadores en sala: {players.length}/2</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {players.map((p) => (
            <li key={p.id}>{p.nombre || `Jugador ${p.id}`}</li>
          ))}
        </ul>
        <p>Esperando al segundo jugador...</p>
      </div>
    );
  }

  return <Juego room={room} socket={socket} players={players} />;
}
