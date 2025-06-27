const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const SECRET = 'secreto';

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar que username y password existan
    if (!username || !password) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    // Hashear la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Insertar usuario en DB
    const result = await db.run(
      `INSERT INTO users(username, password) VALUES(?, ?)`,
      [username, hash]
    );

    res.json({ id: result.lastID, message: 'Usuario registrado' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar que username y password existan
    if (!username || !password) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
