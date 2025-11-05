CREATE DATABASE IF NOT EXISTS truco_db;
USE truco_db;

-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS jugadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de salas
CREATE TABLE IF NOT EXISTS salas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  jugador1_id INT,
  jugador2_id INT,
  estado ENUM('esperando', 'jugando', 'finalizado') DEFAULT 'esperando',
  FOREIGN KEY (jugador1_id) REFERENCES jugadores(id),
  FOREIGN KEY (jugador2_id) REFERENCES jugadores(id)
);

-- Tabla de partidas
CREATE TABLE IF NOT EXISTS partidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sala_id INT NOT NULL,
  ganador_id INT,
  puntos_jugador1 INT DEFAULT 0,
  puntos_jugador2 INT DEFAULT 0,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sala_id) REFERENCES salas(id),
  FOREIGN KEY (ganador_id) REFERENCES jugadores(id)
);
