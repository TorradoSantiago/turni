const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsapp');

// =============================================
// CONTENIDO DEL BOT — editá solo esta sección
// =============================================

const MENU = `¡Hola! 👋 Soy el asistente del consultorio Torrado & Berney.
¿En qué te puedo ayudar?

1️⃣ Horarios de atención
2️⃣ Sacar un turno
3️⃣ Cancelar un turno
4️⃣ Factura digital
5️⃣ Otra consulta`;

const RESPUESTAS = {
  '1': `🕐 *Horarios de atención*

📍 *Olavarría* — Rivadavia 2826
Lunes a Viernes de 8:00 a 12:00 y de 16:00 a 20:00

📍 *Bolívar* — Consultorio Médico Belgrano
Consultar disponibilidad al sacar turno.

📞 Tel: (02284) 441122`,

  '2': `📅 *Sacar un turno*

Elegí el profesional y hacé click en el link para agendar:

👶 *Dr. Pablo Torrado — Oftalmología Infantil (Olavarría)*
https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&

👶 *Dr. Pablo Torrado — Oftalmología Infantil (Bolívar)*
https://paciente.docturno.com/agenda/consultorio-medico-belgrano/torrado-pablo-a?originType=medic-page&

👁️ *Dra. Paula Berney — Oftalmología General (Olavarría)*
https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&`,

  '3': `❌ *Cancelar un turno*

Para cancelar, escribí tu nombre y el turno que querés cancelar.
Una persona del consultorio te va a responder a la brevedad.

⏰ Horario de atención: Lunes a Viernes de 8:00 a 20:00`,

  '4': `🧾 *Factura digital*

Esta función estará disponible próximamente.
Por ahora, solicitá tu factura llamando al (02284) 441122 o escribiendo "factura" junto con tus datos (nombre completo y DNI) y te la enviamos.`,

  '5': `📍 *Contacto y dirección*

🏥 Consultorio Torrado & Berney
📍 Rivadavia 2826, Olavarría, Buenos Aires
📞 (02284) 441122
🕐 Lunes a Viernes de 8:00 a 12:00 y de 16:00 a 20:00

Para cualquier otra consulta, escribí tu mensaje y te responderemos a la brevedad.`,
};

// =============================================
// LÓGICA — no necesitás tocar esto
// =============================================

function obtenerRespuesta(texto) {
  const limpio = texto.trim();
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
