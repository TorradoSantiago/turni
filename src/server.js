const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();
app.use(express.json());

// Ruta raíz — para verificar que el servidor está corriendo
app.get('/', (req, res) => {
  res.send('Bot de WhatsApp Torrado & Berney activo 🟢');
});

app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`📋 Mock mode: ${process.env.MOCK_WHATSAPP === 'true' ? 'ACTIVADO' : 'desactivado'}`);
});
