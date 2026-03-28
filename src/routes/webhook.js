const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsapp');

// Numeros que eligieron hablar con la secretaria — el bot no responde hasta que escriban "menu" o "volver"
const esperandoSecretaria = new Set();

const RCTA_BERNEY_URL = 'https://app.rcta.me/patients/6840e09ec76fe753d2590009d6007ccfd2cc64ac';
const RCTA_TORRADO_URL = 'https://app.rcta.me/patients/50ddbd37b334c9e6a2af2ad9a0e1928158e8f7b0';
const RCTA_BERNEY_RECETA_URL = 'https://app.rcta.me/p/paula-marcela-berney';
const RCTA_TORRADO_RECETA_URL = 'https://app.rcta.me/p/pablo-augusto-torrado-16';
const GUIA_RECETAS_URL = 'https://raw.githubusercontent.com/TorradoSantiago/turni/main/Guia%20-%20Registro%20Recetas%20RCTA.pdf';
const GUIA_SACAR_TURNO_URL = 'https://raw.githubusercontent.com/TorradoSantiago/turni/main/Guia-ComoSacarTurno.pdf';
const GUIA_CANCELAR_TURNO_URL = 'https://raw.githubusercontent.com/TorradoSantiago/turni/main/Guia-CancelarTurno.pdf';

const MENU = `Hola. Soy el asistente del consultorio Torrado & Berney.
En que te puedo ayudar?

1. Horarios de atencion
2. Sacar un turno
3. Cancelar o reprogramar turno
4. Recetas digitales
5. Factura digital
6. Problemas con el registro de recetas
7. Otra consulta`;

const SECRETARIA_ESCAPE = `\n\nSi prefiere hablar con la secretaria, responda *0*`;

const RESPUESTAS = {
  '0': `*Hablar con la secretaria*

Enseguida le atendemos. La secretaria le va a responder a la brevedad por este mismo chat.

Si prefiere llamar directamente:
Tel fijo: (02284) 416078
WhatsApp: (02284) 594020

Cuando quiera volver al menu automatico, escriba *menu*.`,

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
- Viernes: 09:00 a 14:40 hs` + SECRETARIA_ESCAPE,

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
WhatsApp: (02284) 594020` + SECRETARIA_ESCAPE,

  '3': `*Cancelar o reprogramar turno*

Si usted saco el turno online, puede cancelarlo o reprogramarlo desde el mismo link donde lo gestiono:

*Dr. Pablo Torrado - Olavarria*
https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&

*Dr. Pablo Torrado - Bolivar*
https://paciente.docturno.com/agenda/consultorio-medico-belgrano/torrado-pablo-a?originType=medic-page&

*Dra. Paula Berney - Consulta general*
https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&

Si usted saco el turno via secretaria, cancelelo o reprogramelo directamente con ella por WhatsApp o llamando al fijo:
WhatsApp: (02284) 594020
Tel fijo: (02284) 416078` + SECRETARIA_ESCAPE,

  '4': `*Recetas digitales*

Para continuar, responda:

41. Ya estoy registrado en RCTA
42. Todavia no estoy registrado en RCTA

Si tiene problemas con el registro, responda con 6 y le enviamos una guia paso a paso.` + SECRETARIA_ESCAPE,

  '41': `*Recetas digitales - Ya estoy registrado*

Si usted ya esta registrado en RCTA, pida su receta desde el link de su profesional:

*Dra. Paula Berney*
${RCTA_BERNEY_RECETA_URL}

*Dr. Pablo Torrado*
${RCTA_TORRADO_RECETA_URL}

Despues de hacer el pedido, escriba en este chat que medicamento o gota necesita para que podamos seguir el caso.` + SECRETARIA_ESCAPE,

  '42': `*Recetas digitales - Todavia no estoy registrado*

Primero debe registrarse en RCTA con el link de su profesional:

*Dra. Paula Berney*
${RCTA_BERNEY_URL}

*Dr. Pablo Torrado*
${RCTA_TORRADO_URL}

Una vez registrado, use estos links para pedir la receta:

*Dra. Paula Berney*
${RCTA_BERNEY_RECETA_URL}

*Dr. Pablo Torrado*
${RCTA_TORRADO_RECETA_URL}

Despues del pedido, escriba en este chat que medicamento o gota necesita.` + SECRETARIA_ESCAPE,

  '5': `*Factura digital*

Esta funcion estara disponible proximamente.
Por ahora, solicite su factura llamando al (02284) 416078 o escribiendo su nombre completo y DNI y se la enviamos.` + SECRETARIA_ESCAPE,

  '6': `*Problemas con el registro de recetas*

Le dejamos una guia paso a paso para completar el alta en RCTA:
${GUIA_RECETAS_URL}

Si despues de eso sigue con problemas, escriba en este chat:
- nombre y apellido
- medico que lo atiende
- que medicamento o gota necesita
- en que paso del registro se trabo` + SECRETARIA_ESCAPE,

  '43': `*Problemas con el registro de recetas*

Le dejamos una guia paso a paso para completar el alta en RCTA:
${GUIA_RECETAS_URL}

Si despues de eso sigue con problemas, escriba en este chat:
- nombre y apellido
- medico que lo atiende
- que medicamento o gota necesita
- en que paso del registro se trabo` + SECRETARIA_ESCAPE,

  '7': `*Contacto y direccion*

Consultorio Torrado & Berney
Vicente Lopez 2061, Olavarria, Buenos Aires
Tel fijo: (02284) 416078
WhatsApp: (02284) 594020

Para cualquier otra consulta, escriba su mensaje y le responderemos a la brevedad.` + SECRETARIA_ESCAPE,
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
      if (!esperandoSecretaria.has(from)) {
        await whatsapp.sendTextMessage(from, MENU);
      }
      return;
    }

    const texto = message.text.body;
    console.log(`Mensaje de ${from}: "${texto}"`);

    // Si el paciente eligio hablar con la secretaria, solo reaccionar a "menu" o "volver"
    if (esperandoSecretaria.has(from)) {
      const limpio = texto.trim().toLowerCase();
      if (limpio === 'menu' || limpio === 'volver' || limpio === 'volver al menu') {
        esperandoSecretaria.delete(from);
        await whatsapp.sendTextMessage(from, MENU);
        console.log(`${from} volvio al menu`);
      }
      return;
    }

    const respuesta = obtenerRespuesta(texto);

    // Si eligio opcion 0, activar modo secretaria
    if (texto.trim() === '0') {
      esperandoSecretaria.add(from);
      console.log(`${from} eligio hablar con la secretaria`);
    }

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
