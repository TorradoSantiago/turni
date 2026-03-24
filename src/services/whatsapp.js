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

function stripArgentinaMobilePrefix(number) {
  if (number.startsWith('549')) {
    return `54${number.slice(3)}`;
  }

  return number;
}

async function postTextMessage(url, token, to, text) {
  const res = await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
}

function logMetaError(err, to) {
  console.error('❌ Error enviando mensaje a Meta');
  console.error('to:', to);
  console.error('status:', err.response?.status);
  console.error('data:', JSON.stringify(err.response?.data, null, 2));
  console.error('message:', err.message);
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
  const recipient = sanitizeEnv(to);

  if (!TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID en .env');
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  try {
    return await postTextMessage(url, TOKEN, recipient, text);
  } catch (err) {
    const errorCode = err.response?.data?.error?.code;
    const fallbackRecipient = stripArgentinaMobilePrefix(recipient);

    if (errorCode === 131030 && fallbackRecipient !== recipient) {
      console.warn(`Reintentando envio para Argentina sin 9 movil: ${recipient} -> ${fallbackRecipient}`);

      try {
        return await postTextMessage(url, TOKEN, fallbackRecipient, text);
      } catch (retryErr) {
        logMetaError(retryErr, fallbackRecipient);
        throw retryErr;
      }
    }

    logMetaError(err, recipient);
    throw err;
  }
}

module.exports = { sendTextMessage };
