const axios = require('axios');

async function sendTextMessage(to, text) {
  // Modo mock para testing local sin credenciales de Meta
  if (process.env.MOCK_WHATSAPP === 'true') {
    console.log(`📤 [MOCK] Para ${to}:\n${text}\n`);
    return { mock: true, to, text };
  }

  const TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID en .env');
  }

  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const res = await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  }, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
}

module.exports = { sendTextMessage };
