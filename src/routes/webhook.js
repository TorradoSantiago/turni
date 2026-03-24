const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsapp');

// =============================================
// CONTENIDO DEL BOT — editá solo esta sección
// =============================================

// Pie que aparece al final de cada respuesta (menos cancelar/secretaría que ya derivan a humano)
const FOOTER = `
——————————
📋 Escribí el número de otra opción o *menú* para volver al inicio.
❓ ¿Necesitás hablar con nosotros? Escribí *0*`;

const MENU = `¡Hola! 👋 Soy el asistente del consultorio *Torrado & Berney*.

¿En qué te puedo ayudar?

1️⃣ Horarios de atención
2️⃣ Sacar un turno
3️⃣ Cancelar un turno
4️⃣ Factura digital
5️⃣ Dirección y contacto
0️⃣ Hablar con la secretaría`;

const RESPUESTAS = {
  '1': `🕐 *Horarios de atención*

_Los horarios son estimativos. La disponibilidad real la ves al sacar el turno online._

👶 *Dr. Pablo Torrado — Oftalmología Infantil*

📍 Olavarría — Vicente López 2061
• Lunes: 12:00 a 17:30 hs
• Martes: 10:30 a 17:30 hs
• Jueves: 08:00 a 13:30 hs
• Viernes: 08:00 a 14:00 hs

📍 Bolívar — Laprida 156
• Miércoles: 09:00 a 15:55 hs

👁️ *Dra. Paula Berney — Oftalmología General*

📍 Olavarría — Vicente López 2061
• Lunes: 12:00 a 16:20 hs
• Martes: 09:00 a 14:40 hs
• Miércoles: 11:20 a 15:40 hs
• Jueves: 09:00 a 15:20 hs
• Viernes: 09:00 a 14:40 hs` + FOOTER,

  '2': `📅 *Sacar un turno*

Tocá el link del médico que necesitás y elegí el día y hora que mejor te quede 👇

——————————
👶 *Dr. Torrado — Oftalmología Infantil*

📍 Olavarría:
https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&

📍 Bolívar:
https://paciente.docturno.com/agenda/consultorio-medico-belgrano/torrado-pablo-a?originType=medic-page&

——————————
👁️ *Dra. Berney — Oftalmología General*

📍 Olavarría:
https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&
——————————
_¿Necesitás ayuda para sacar el turno? Escribí *0* y te asistimos._`,

  '3': `❌ *Cancelar un turno*

Escribí tu *nombre completo* y *el día y hora del turno* que querés cancelar.

Una persona del consultorio te va a responder a la brevedad 🙌`,

  '4': `🧾 *Factura digital*

Esta función estará disponible próximamente.

Por ahora, para solicitar tu factura escribí tu *nombre completo y DNI* y te la enviamos.` + FOOTER,

  '5': `📍 *Dirección y contacto*

🏥 *Consultorio Torrado & Berney*
📍 Vicente López 2061, Olavarría, Buenos Aires
📞 Tel: (02284) 416078
📱 WhatsApp: (02284) 594020` + FOOTER,

  '0': `👋 ¡Hola! Te comunicás directamente con el consultorio.

Escribí tu consulta o tu nombre y en cuanto podamos te respondemos.

⏰ Atendemos de Lunes a Viernes en horario de consultorio.`,
};

// =============================================
// LÓGICA — no necesitás tocar esto
// =============================================

function obtenerRespuesta(texto) {
  const limpio = texto.trim().toLowerCase();
  // Acepta "menu", "menú", "inicio", "hola" como atajos al menú
  if (['menu', 'menú', 'inicio', 'hola', 'hi', 'buenas'].includes(limpio)) return MENU;
  return RESPUESTAS[limpio] || MENU;
}

// GET — Verificación del webhook (Meta lo llama una sola vez)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado correctamente');
    return res.status(200).send(challenge);
  }

  console.log('❌ Verificación fallida — token no coincide');
  return res.status(403).send('Forbidden');
});

// POST — Mensajes entrantes
router.post('/', async (req, res) => {
  // Responder 200 inmediatamente (Meta requiere respuesta rápida)
  res.sendStatus(200);

  try {
    const entry = req.body.entry && req.body.entry[0];
    const changes = entry && entry.changes && entry.changes[0];
    const value = changes && changes.value;
    const messages = value && value.messages;

    if (!messages || !messages[0]) return;

    const message = messages[0];
    const from = message.from;

    // Solo procesamos mensajes de texto
    if (message.type !== 'text') {
      await whatsapp.sendTextMessage(from, MENU);
      return;
    }

    const texto = message.text.body;
    console.log(`📩 Mensaje de ${from}: "${texto}"`);

    const respuesta = obtenerRespuesta(texto);
    await whatsapp.sendTextMessage(from, respuesta);
    console.log(`✅ Respuesta enviada a ${from}`);

  } catch (err) {
    console.error('❌ Error procesando mensaje:', err.message);
  }
});

module.exports = router;
