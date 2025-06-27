const axios = require('axios');

const enviarMensajeTelegram = async (mensaje) => {
  const TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TOKEN || !CHAT_ID) {
    throw new Error('Faltan variables de entorno TELEGRAM_TOKEN o TELEGRAM_CHAT_ID');
  }

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: CHAT_ID,
    text: mensaje
  });
};

module.exports = { enviarMensajeTelegram };
