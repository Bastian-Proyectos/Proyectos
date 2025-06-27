// models/User.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./verdevital.db'); // Conectar con la base de datos SQLite

// Crear tabla de usuarios si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );`);
});

module.exports = db; // Exportamos la conexión de base de datos
