// back/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

const salas = {}; // memoria temporal

io.on("connection", (socket) => {
  console.log(" Usuario conectado:", socket.id);

  socket.on("joinRoom", async ({ room }) => {
    if (!salas[room]) salas[room] = [];
    if (salas[room].length >= 2) {
      socket.emit("room:full");
      return;
    }

    salas[room].push(socket.id);
    socket.join(room);
    console.log(`Jugador ${socket.id} se unió a sala ${room}`);

    io.to(room).emit("room:players", { players: salas[room].map((id) => ({ id })) });

    if (salas[room].length === 2) {
      io.to(room).emit("room:ready", { ready: true });

      // Crear sala en la base de datos si no existe
      await pool.query(
        "INSERT IGNORE INTO salas (codigo, estado) VALUES (?, 'jugando')",
        [room]
      );

      // Repartir cartas iniciales (simples)
      const cartas = [
        { id: 1, nombre: "1 de Espada", valor: 14 },
        { id: 2, nombre: "7 de Oro", valor: 10 },
        { id: 3, nombre: "5 de Copa", valor: 5 },
      ];
      io.to(room).emit("deal", { cartas });
    }
  });

  socket.on("playCard", ({ carta, room }) => {
    io.to(room).emit("playCard", { local: carta.nombre, rival: "Esperando..." });
  });

  socket.on("disconnect", () => {
    console.log(" Usuario desconectado:", socket.id);
    for (const room in salas) {
      salas[room] = salas[room].filter((id) => id !== socket.id);
      if (salas[room].length === 0) delete salas[room];
    }
  });
});

app.get("/", (req, res) => {
  res.send("Servidor Truco corriendo correctamente ");
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Servidor backend en puerto ${PORT}`));
