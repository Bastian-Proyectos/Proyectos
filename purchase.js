const express = require('express');
const db = require('../db');
const sendTelegramMessage = require('../telegram');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET = 'secreto';

router.post('/', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Token faltante' });

  let userId;
  try {
    const decoded = jwt.verify(token, SECRET);
    userId = decoded.id;
  } catch {
    return res.status(403).json({ error: 'Token inválido' });
  }

  const { item, amount } = req.body;
  db.run(`INSERT INTO purchases(user_id, item, amount) VALUES(?, ?, ?)`, [userId, item, amount], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    sendTelegramMessage(`Nueva compra:\nUsuario ID: ${userId}\nItem: ${item}\nMonto: $${amount}`);
    res.json({ id: this.lastID });
  });
});

module.exports = router;
