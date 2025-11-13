require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuración de conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'truco_game',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para verificar la conexión
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a MySQL correctamente');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    
    // Verificar que la base de datos existe
    const [rows] = await connection.query('SELECT DATABASE() as db');
    console.log(`   Base activa: ${rows[0].db}`);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:');
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Código: ${error.code}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Verifica usuario y contraseña en el archivo .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   → La base de datos no existe. Ejecuta schema.sql primero');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   → MySQL no está corriendo. Inicia el servidor MySQL');
    }
    
    return false;
  }
}

// Función helper para ejecutar queries con manejo de errores
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error en query:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

// Función para obtener una conexión del pool
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error obteniendo conexión:', error.message);
    throw error;
  }
}

// Función para cerrar el pool al finalizar
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error cerrando pool:', error.message);
  }
}

// Exportar funciones
module.exports = {
  pool,
  query,
  getConnection,
  checkConnection,
  closePool
};