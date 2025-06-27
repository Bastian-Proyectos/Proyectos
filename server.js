require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos verdevital.db
const db = new sqlite3.Database('./verdevital.db', (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a verdevital.db');
  }
});

app.use(cors());
app.use(express.json());

// Ruta de inicio de sesión
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.get(sql, [email, password], (err, row) => {
    if (err) {
      console.error('❌ Error al consultar:', err.message);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (row) {
      res.json({ ok: true, message: 'Inicio de sesión exitoso' });
    } else {
      res.status(401).json({ ok: false, message: 'Email o contraseña incorrectos' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
