const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsapp');
const invoicing = require('../services/invoicing');

// Verification endpoint
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('mode recibido:', mode);
  console.log('token recibido:', token);
  console.log('token esperado:', process.env.WHATSAPP_VERIFY_TOKEN);
  console.log('challenge recibido:', challenge);

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send('Forbidden');
});

// Incoming messages
router.post('/', async (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body, null, 2));

  try {
    const entry = Array.isArray(req.body.entry) && req.body.entry[0];
    const changes = entry && Array.isArray(entry.changes) && entry.changes[0];
    const value = changes && changes.value;
    const messages = value && value.messages;

    if (messages && messages[0]) {
      const message = messages[0];
      const from = message.from;
      const text = message.text && message.text.body ? message.text.body.trim().toLowerCase() : '';
      console.log(`Message from ${from}: ${text}`);

      // Keywords for appointment requests
      const keywords = ['turno', 'turnos', 'consulta', 'agendar', 'reservar'];
      const menu =
        'Por favor elija una opción:\n' +
        '1) Oftalmología Infantil\n' +
        '2) Oftalmología General\n' +
        '3) Oftalmología Infantil Bolívar';

      // Check for appointment keywords
      if (keywords.some(k => text.includes(k))) {
        await whatsapp.sendTextMessage(from, menu);
      } else if (text === '1') {
        const docturnoLink = process.env.DOCTURNO_LINK_INFANTIL || 'Enlace no disponible.';
        const invoiceURL = invoicing.generateInvoiceURL({
          email: from,
          name: `Cliente ${from}`,
          description: 'Oftalmología Infantil',
        });
        const response = `Link para agendar:\n${docturnoLink}\n\nLink para factura:\n${invoiceURL}`;
        await whatsapp.sendTextMessage(from, response);
      } else if (text === '2') {
        const docturnoLink = process.env.DOCTURNO_LINK_GENERAL || 'Enlace no disponible.';
        const invoiceURL = invoicing.generateInvoiceURL({
          email: from,
          name: `Cliente ${from}`,
          description: 'Oftalmología General',
        });
        const response = `Link para agendar:\n${docturnoLink}\n\nLink para factura:\n${invoiceURL}`;
        await whatsapp.sendTextMessage(from, response);
      } else if (text === '3') {
        const docturnoLink = process.env.DOCTURNO_LINK_BOLIVAR || 'Enlace no disponible.';
        const invoiceURL = invoicing.generateInvoiceURL({
          email: from,
          name: `Cliente ${from}`,
          description: 'Oftalmología Infantil Bolívar',
        });
        const response = `Link para agendar:\n${docturnoLink}\n\nLink para factura:\n${invoiceURL}`;
        await whatsapp.sendTextMessage(from, response);
      } else {
        // Default reply
        await whatsapp.sendTextMessage(from, 'Gracias por tu mensaje. ¿Necesitas un turno? Escribe "turno" para más opciones.');
      }
    }
  } catch (err) {
    console.error('Error handling incoming webhook:', err);
  }

  // Always respond 200 to acknowledge receipt
  res.sendStatus(200);
});

module.exports = router;
