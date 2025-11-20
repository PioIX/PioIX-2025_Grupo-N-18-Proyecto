require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Importar configuración de MySQL
const db = require('./config/mysql');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// ==================== MIDDLEWARES ====================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ==================== VERIFICAR BD AL INICIAR ====================
(async () => {
  const connected = await db.checkConnection();
  if (!connected) {
    console.error('⚠️  No se pudo conectar a MySQL. Verifica:');
    console.error('   1. MySQL está corriendo');
    console.error('   2. Las credenciales en .env son correctas');
    console.error('   3. La base de datos "truco_game" existe');
    process.exit(1);
  }
})();

// ==================== RUTAS ====================

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: '🎮 Servidor Truco funcionando',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      register: 'POST /api/register',
      login: 'POST /api/login',
      stats: 'GET /api/user/:userId/stats'
    }
  });
});

// ==================== REGISTRO ====================
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validaciones
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
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

    // Generar token JWT
    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Usuario registrado: ${username}`);

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

// ==================== LOGIN ====================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Validaciones
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  try {
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

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`Login exitoso: ${username}`);

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

// ==================== ESTADÍSTICAS ====================
app.get('/api/user/:userId/stats', async (req, res) => {
  const { userId } = req.params;

  try {
    const stats = await db.query(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );

    if (stats.length === 0) {
      return res.status(404).json({ error: 'Estadísticas no encontradas' });
    }

    res.json(stats[0]);
  } catch (error) {
    console.error(' Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

app.post('/api/user/:userId/stats', async (req, res) => {
  const { userId } = req.params;
  const { games_played, games_won, games_lost, games_vs_ia, games_vs_player, total_points } = req.body;

  try {
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
    console.error(' Error actualizando estadísticas:', error);
    res.status(500).json({ error: 'Error al actualizar estadísticas' });
  }
});

// ==================== WEBSOCKETS ====================
// El código de websockets sigue igual

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🎮 SERVIDOR TRUCO INICIADO          ║
╠════════════════════════════════════════╣
║   Puerto: ${PORT}                        ║
║   Frontend: ${process.env.FRONTEND_URL}  ║
║   Base de datos: ${process.env.DB_NAME}  ║
╚════════════════════════════════════════╝
  `);
});

// Cierre limpio bravo
process.on('SIGINT', async () => {
  console.log('\n Cerrando servidor...');
  await db.closePool();  // Asegúrate de que este método esté implementado en tu archivo mysql.js
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error(' Error no manejado:', error);
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));