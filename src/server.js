// Página de bienvenida opcional para evitar "Cannot GET /"
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();
app.use(express.json());

// Ruta raíz opcional
app.get('/', (req, res) => {
  res.send('¡Bot de WhatsApp Oftalmología activo! Usa /webhook para pruebas.');
});

app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
