/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Archivo: services/whatsapp.js                               ║
 * ║  Qué hace: envía mensajes de texto a través de la API de Meta ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Este archivo tiene una sola responsabilidad: tomar un texto
 * y enviarlo al número de WhatsApp del paciente usando la API de Meta.
 *
 * Si MOCK_WHATSAPP=true en el .env, no envía nada real —
 * solo imprime el mensaje en la consola. Útil para desarrollo.
 *
 * SEGURIDAD:
 * - El token de acceso (WHATSAPP_TOKEN) nunca está hardcodeado acá.
 *   Vive en el archivo .env que está en el .gitignore (no se sube a GitHub).
 * - Si el token se filtra, regenerarlo en Meta for Developers.
 */

const axios = require('axios');

/**
 * Envía un mensaje de texto a un número de WhatsApp.
 * @param {string} to   - Número destino con código de país, sin + (ej: "5492284511188")
 * @param {string} text - Texto del mensaje
 */
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
