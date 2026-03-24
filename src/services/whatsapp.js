const axios = require('axios');

function sanitizeEnv(value) {
  if (value == null) return '';

  const trimmed = String(value).trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

async function sendTextMessage(to, text) {
  // Modo mock para testing local sin credenciales de Meta
  if (process.env.MOCK_WHATSAPP === 'true') {
    console.log(`📤 [MOCK] Para ${to}:\n${text}\n`);
    return { mock: true, to, text };
  }

  const TOKEN = sanitizeEnv(process.env.WHATSAPP_TOKEN);
  const PHONE_NUMBER_ID = sanitizeEnv(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const GRAPH_API_VERSION = sanitizeEnv(process.env.WHATSAPP_GRAPH_VERSION) || 'v25.0';

  if (!TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID en .env');
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  try {
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
  } catch (err) {
    console.error('❌ Error enviando mensaje a Meta');
    console.error('status:', err.response?.status);
    console.error('data:', JSON.stringify(err.response?.data, null, 2));
    console.error('message:', err.message);
    throw err;
  }
}

module.exports = { sendTextMessage };
