/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  TURNI — Bot de WhatsApp para Consultorio Torrado & Berney   ║
 * ║  Archivo: server.js                                          ║
 * ║  Qué hace: arranca el servidor y lo pone a escuchar mensajes ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Este es el punto de entrada del bot. Cuando ejecutás "node src/server.js",
 * este archivo levanta un servidor web en el puerto 3000 (o el que tengas
 * en el .env) y conecta la ruta /webhook donde llegan los mensajes de WhatsApp.
 *
 * ¿Por qué necesitamos un servidor?
 * Meta (WhatsApp) necesita una URL pública a la que enviar los mensajes.
 * Cuando alguien escribe al número del consultorio, Meta hace un POST a esa URL.
 * Este servidor está escuchando en esa URL y procesa el mensaje.
 */

const dotenv = require('dotenv');
dotenv.config(); // Carga las variables del archivo .env (tokens, puerto, etc.)

const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();

// Necesario para que Express pueda leer el JSON que manda Meta
app.use(express.json());

// Ruta raíz — sirve para verificar que el servidor está corriendo
// Si entrás a http://localhost:3000 en el browser, deberías ver el mensaje verde
app.get('/', (req, res) => {
  res.send('Bot de WhatsApp Torrado & Berney activo 🟢');
});

// Monta las rutas del webhook en /webhook
// Toda la lógica del bot está en src/routes/webhook.js
app.use('/webhook', webhookRouter);

// Levanta el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🔗 Webhook URL local: http://localhost:${PORT}/webhook`);
  console.log(`📋 Mock mode: ${process.env.MOCK_WHATSAPP === 'true' ? 'ACTIVADO (no envía mensajes reales)' : 'desactivado (modo producción)'}`);
  console.log(`─────────────────────────────────────`);
  console.log(`📖 Para probar localmente: node test.js`);
  console.log(`🌐 Para exponer a internet: ngrok http ${PORT}`);
});
