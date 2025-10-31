// src/hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketIo = io('http://localhost:4000');
    setSocket(socketIo);

    socketIo.on('connect', () => {
      setIsConnected(true);
    });

    socketIo.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
