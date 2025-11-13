require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Importar configuración de MySQL
const db = require('./mysql');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Verificar conexión a la base de datos al iniciar
db.checkConnection();

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor de Truco funcionando correctamente',
    version: '1.0.0',
    status: 'online'
  });
});

// Registro de usuario
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validaciones
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'El usuario o email ya existe' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const userId = result.insertId;

    // Crear estadísticas del usuario
    await db.query(
      'INSERT INTO user_stats (user_id) VALUES (?)',
      [userId]
    );

    // Generar token
    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: userId, username, email },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validaciones
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    }

    // Buscar usuario
    const users = await db.query(
      'SELECT id, username, email, password FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = users[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener estadísticas del usuario
app.get('/api/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await db.query(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );

    if (stats.length === 0) {
      return res.status(404).json({ error: 'Estadísticas no encontradas' });
    }

    res.json(stats[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Actualizar estadísticas del usuario
app.post('/api/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { games_played, games_won, games_lost, games_vs_ia, games_vs_player, total_points } = req.body;

    await db.query(
      `UPDATE user_stats SET 
        games_played = games_played + ?,
        games_won = games_won + ?,
        games_lost = games_lost + ?,
        games_vs_ia = games_vs_ia + ?,
        games_vs_player = games_vs_player + ?,
        total_points = total_points + ?
      WHERE user_id = ?`,
      [games_played || 0, games_won || 0, games_lost || 0, games_vs_ia || 0, games_vs_player || 0, total_points || 0, userId]
    );

    res.json({ message: 'Estadísticas actualizadas' });
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
    res.status(500).json({ error: 'Error al actualizar estadísticas' });
  }
});

// Obtener historial de partidas
app.get('/api/user/:userId/games', async (req, res) => {
  try {
    const { userId } = req.params;

    const games = await db.query(
      `SELECT g.*, 
        u1.username as player1_name,
        u2.username as player2_name,
        winner.username as winner_name
      FROM games g
      LEFT JOIN users u1 ON g.player1_id = u1.id
      LEFT JOIN users u2 ON g.player2_id = u2.id
      LEFT JOIN users winner ON g.winner_id = winner.id
      WHERE g.player1_id = ? OR g.player2_id = ?
      ORDER BY g.created_at DESC
      LIMIT 20`,
      [userId, userId]
    );

    res.json(games);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error al obtener historial de partidas' });
  }
});

// ==================== WEBSOCKETS PARA MULTIJUGADOR ====================

// Almacenar salas activas
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Crear sala
  socket.on('create_room', ({ roomCode, playerName, userId }) => {
    socket.join(roomCode);
    
    rooms.set(roomCode, {
      players: [{ id: socket.id, name: playerName, userId }],
      gameState: null,
      status: 'waiting'
    });

    socket.emit('room_created', { roomCode });
    console.log(`Sala creada: ${roomCode} por ${playerName}`);
  });

  // Unirse a sala
  socket.on('join_room', ({ roomCode, playerName, userId }) => {
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('error', { message: 'Sala no encontrada' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Sala llena' });
      return;
    }

    socket.join(roomCode);
    room.players.push({ id: socket.id, name: playerName, userId });
    room.status = 'playing';

    // Notificar a ambos jugadores
    io.to(roomCode).emit('player_joined', {
      players: room.players,
      message: 'Oponente conectado'
    });

    // Iniciar juego
    startGame(roomCode);
    console.log(`Jugador ${playerName} se unió a sala ${roomCode}`);
  });

  // Jugar carta
  socket.on('play_card', ({ roomCode, card }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    // Enviar jugada al oponente
    socket.to(roomCode).emit('opponent_played', { card });
  });

  // Acciones del juego (Truco, Envido, etc.)
  socket.on('game_action', ({ roomCode, action }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    socket.to(roomCode).emit('opponent_action', { action });
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    // Limpiar salas
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        io.to(roomCode).emit('player_disconnected');
        rooms.delete(roomCode);
      }
    });
  });
});

// Función para iniciar juego
function startGame(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.players.length < 2) return;

  // Crear mazo y repartir cartas
  const deck = createDeck();
  
  const gameState = {
    player1Hand: deck.slice(0, 3),
    player2Hand: deck.slice(3, 6),
    currentTurn: 0,
    round: 1
  };

  room.gameState = gameState;

  // Enviar cartas a cada jugador
  io.to(room.players[0].id).emit('game_start', {
    yourHand: gameState.player1Hand,
    isYourTurn: true,
    opponentName: room.players[1].name
  });

  io.to(room.players[1].id).emit('game_start', {
    yourHand: gameState.player2Hand,
    isYourTurn: false,
    opponentName: room.players[0].name
  });

  console.log(`Juego iniciado en sala ${roomCode}`);
}

// Crear mazo
function createDeck() {
  const suits = ['oro', 'copa', 'espada', 'basto'];
  const values = ['1', '2', '3', '4', '5', '6', '7', '10', '11', '12'];
  const cardPowers = {
    '1': 14, '2': 9, '3': 10, '4': 1, '5': 2, 
    '6': 3, '7': 12, '10': 5, '11': 6, '12': 7
  };

  const deck = [];
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ suit, value, power: cardPowers[value] });
    });
  });

  // Barajar
  return deck.sort(() => Math.random() - 0.5);
}

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`
  ================================
  🎮 Servidor Truco iniciado
  ================================
  Puerto: ${PORT}
  Frontend: ${process.env.FRONTEND_URL}
  ================================
  `);
});

// Manejo de errores
process.on('unhandledRejection', (error) => {
  console.error('Error no manejado:', error);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await db.pool.end();
  process.exit(0);
});