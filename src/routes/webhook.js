const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsapp');

const RCTA_BERNEY_URL = 'https://app.rcta.me/patients/6840e09ec76fe753d2590009d6007ccfd2cc64ac';
const RCTA_TORRADO_URL = 'https://app.rcta.me/patients/50ddbd37b334c9e6a2af2ad9a0e1928158e8f7b0';
const GUIA_RECETAS_URL = 'https://raw.githubusercontent.com/TorradoSantiago/turni/main/Guia%20-%20Registro%20Recetas%20RCTA.pdf';

const MENU = `Hola. Soy el asistente del consultorio Torrado & Berney.
En que te puedo ayudar?

1. Horarios de atencion
2. Sacar un turno
3. Cancelar un turno
4. Recetas digitales
5. Factura digital
6. Problemas con el registro de recetas
7. Otra consulta`;

const RESPUESTAS = {
  '1': `*Horarios de atencion*

Los horarios son estimativos. Para ver disponibilidad real, pedi turno online.

*Dr. Pablo Torrado - Oftalmologia Infantil*

Olavarria - Vicente Lopez 2061
- Lunes: 12:00 a 17:30 hs
- Martes: 10:30 a 17:30 hs
- Jueves: 08:00 a 13:30 hs
- Viernes: 08:00 a 14:00 hs

Bolivar - Laprida 156
- Miercoles: 09:00 a 15:55 hs

*Dra. Paula Berney - Oftalmologia General*

Olavarria - Vicente Lopez 2061
- Lunes: 12:00 a 16:20 hs
- Martes: 09:00 a 14:40 hs
- Miercoles: 11:20 a 15:40 hs
- Jueves: 09:00 a 15:20 hs
- Viernes: 09:00 a 14:40 hs`,

  '2': `*Sacar un turno*

*Dr. Pablo Torrado - Oftalmologia Infantil*

Olavarria:
https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&

Bolivar:
https://paciente.docturno.com/agenda/consultorio-medico-belgrano/torrado-pablo-a?originType=medic-page&

------------------------------

*Dra. Paula Berney - Oftalmologia General*

Consulta general:
https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&

Estudios o cirugia:
comunicarse directamente con el consultorio.
Tel fijo: (02284) 416078
WhatsApp: (02284) 594020`,

  '3': `*Cancelar un turno*

Para cancelar, escribi tu nombre y el turno que queres cancelar.
Una persona del consultorio te va a responder a la brevedad.

Atencion: lunes a viernes en horario de consultorio.`,

  '4': `*Recetas digitales*

Si usted necesita una receta, primero debe registrarse en RCTA con el link de su profesional:

*Dra. Paula Berney*
${RCTA_BERNEY_URL}

*Dr. Pablo Torrado*
${RCTA_TORRADO_URL}

Importante:
inmediatamente despues de completar el registro, escriba en este chat que gota o medicamento necesita.

Si tiene problemas con el registro, responda con 6 y le enviamos una guia paso a paso.`,

  '5': `*Factura digital*

Esta funcion estara disponible proximamente.
Por ahora, solicite su factura llamando al (02284) 416078 o escribiendo su nombre completo y DNI y se la enviamos.`,

  '6': `*Problemas con el registro de recetas*

Le dejamos una guia paso a paso para completar el alta en RCTA:
${GUIA_RECETAS_URL}

Si despues de eso sigue con problemas, escriba en este chat:
- nombre y apellido
- medico que lo atiende
- que medicamento o gota necesita
- en que paso del registro se trabo`,

  '7': `*Contacto y direccion*

Consultorio Torrado & Berney
Vicente Lopez 2061, Olavarria, Buenos Aires
Tel fijo: (02284) 416078
WhatsApp: (02284) 594020

Para cualquier otra consulta, escriba su mensaje y le responderemos a la brevedad.`,
};

function obtenerRespuesta(texto) {
  const limpio = texto.trim();
  return RESPUESTAS[limpio] || MENU;
}

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verificado correctamente');
    return res.status(200).send(challenge);
  }

  console.log('Verificacion fallida: token no coincide');
  return res.status(403).send('Forbidden');
});

router.post('/', async (req, res) => {
  res.sendStatus(200);

  try {
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const messages = value?.messages;

    if (!messages || !messages[0]) return;

    const message = messages[0];
    const from = value?.contacts?.[0]?.wa_id || message.from;

    if (message.type !== 'text') {
      await whatsapp.sendTextMessage(from, MENU);
      return;
    }

    const texto = message.text.body;
    console.log(`Mensaje de ${from}: "${texto}"`);

    const respuesta = obtenerRespuesta(texto);
    await whatsapp.sendTextMessage(from, respuesta);
    console.log(`Respuesta enviada a ${from}`);
  } catch (err) {
    console.error('Error procesando mensaje');
    console.error('status:', err.response?.status);
    console.error('data:', JSON.stringify(err.response?.data, null, 2));
    console.error('message:', err.message);
  }
});

module.exports = router;
