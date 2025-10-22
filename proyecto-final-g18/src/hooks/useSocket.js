// src/hooks/useSocket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

/**
 * useSocket: hook minimal para conectarse a un servidor socket.io
 * ADAPTAR la URL al servidor real (por defecto http://localhost:4000)
 *
 * Eventos esperados del servidor (según apunte):
 * - room:players -> lista de jugadores en la sala
 * - room:ready -> sala lista para jugar
 * - deal, turn:update, play:accepted, round:result, game:end, error:game
 *
 * Eventos emitidos por el frontend:
 * - joinRoom {room}
 * - requestDeal {room}
 * - playCard {room, carta}
 */
export default function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Cambiá la URL si tu backend corre en otro puerto/dominio
    const socketIo = io("http://localhost:4000", {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      setIsConnected(true);
      console.log("Socket conectado:", socketIo.id);
    });

    socketIo.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket desconectado");
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
