// back/db.js
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",         //  poné tu usuario de MySQL
  password: "",         //  tu contraseña
  database: "truco_db"  // el nombre de tu base (lo creamos más abajo)
});
