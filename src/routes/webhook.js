const express = require('express');
const router = express.Router();
const whatsapp = require('../services/whatsapp');

// Numeros que eligieron hablar con la secretaria — el bot no responde hasta que escriban "menu" o "volver"
const esperandoSecretaria = new Set();

// URLs de DocTurno — agendas de turnos online
const DOCTURNO_TORRADO_OLA = 'https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&';
const DOCTURNO_TORRADO_BOL = 'https://paciente.docturno.com/agenda/consultorio-medico-belgrano/torrado-pablo-a?originType=medic-page&';
const DOCTURNO_BERNEY = 'https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&';

// URLs de RCTA — recetas digitales
const RCTA_BERNEY_URL = 'https://app.rcta.me/patients/6840e09ec76fe753d2590009d6007ccfd2cc64ac';
const RCTA_TORRADO_URL = 'https://app.rcta.me/patients/50ddbd37b334c9e6a2af2ad9a0e1928158e8f7b0';
const RCTA_BERNEY_RECETA_URL = 'https://app.rcta.me/p/paula-marcela-berney';
const RCTA_TORRADO_RECETA_URL = 'https://app.rcta.me/p/pablo-augusto-torrado-16';

// Guias PDF
const GUIA_RECETAS_URL = 'https://raw.githubusercontent.com/TorradoSantiago/turni/main/Guia%20-%20Registro%20Recetas%20RCTA.pdf';
const GUIA_SACAR_TURNO_URL = 'https://raw.githubusercontent.com/TorradoSantiago/turni/main/Guia-ComoSacarTurno.pdf';
const GUIA_CANCELAR_TURNO_URL = 'https://raw.githubusercontent.com/TorradoSantiago/turni/main/Guia-CancelarTurno.pdf';

const MENU = `Hola. Soy Turni, el asistente del consultorio del Dr. Torrado y la Dra. Berney.
En que te puedo ayudar? Estoy aqui para ayudarte con turnos, recetas y consultas generales.
El funcionamiento es simple: solo escriba el numero de lo que necesita.

1. Horarios de atencion
2. Sacar un turno
3. Cancelar o reprogramar turno
4. Recetas digitales
5. Factura digital
6. Otra consulta

0. Hablar con la secretaria`;

// Escape para opciones relacionadas con turnos (1, 2, 6) — activa modo secretaria con instrucciones de turno
const SECRETARIA_ESCAPE = `\n\nCuando quiera volver al menu automatico, escriba *menu*.\nSi prefiere hablar con la secretaria, responda *0*.`;

// Escape para opciones generales (3, 4, 5, 41, 42, 43) — activa modo secretaria con handoff simple
const SECRETARIA_ESCAPE_SIMPLE = `\n\nCuando quiera volver al menu automatico, escriba *menu*.\nSi prefiere hablar con la secretaria, responda *00*.`;

const RESPUESTAS = {
  '0': `*Hablar con la secretaria*

Si su consulta es para solicitar un turno que no pudo sacar online, chequee primero la guia de DocTurno:
${GUIA_SACAR_TURNO_URL}

Si aun no puede sacar el turno y quiere que la secretaria se lo saque, siga estos pasos:

1) *Chequee la disponibilidad de turnos y horarios*:
Dr. Torrado: ${DOCTURNO_TORRADO_OLA}
Dra. Berney: ${DOCTURNO_BERNEY}

2) *Escriba en este chat* el turno que quiere sacar e informenos:
- Fecha, hora y profesional
- Su nombre y apellido completo
- DNI
- Fecha de nacimiento

Luego de completar estos datos le agendaremos el turno y se lo confirmaremos por este mismo chat.
La secretaria le va a responder a la brevedad.

Cuando quiera volver al menu automatico, escriba *menu*.`,

  '00': `*Hablar con la secretaria*

La secretaria le va a responder a la brevedad por este mismo chat.

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
${DOCTURNO_TORRADO_OLA}

Bolivar:
${DOCTURNO_TORRADO_BOL}

------------------------------

*Dra. Paula Berney - Oftalmologia General*

Consulta general:
${DOCTURNO_BERNEY}

Estudios o cirugia:
comunicarse directamente con el consultorio.
Tel fijo: (02284) 416078
WhatsApp: (02284) 594020

Si necesita ayuda para sacar el turno, le dejamos esta guia paso a paso:
${GUIA_SACAR_TURNO_URL}` + SECRETARIA_ESCAPE,

  '3': `*Cancelar o reprogramar turno*

Si usted saco el turno online, puede cancelarlo o reprogramarlo desde el mismo link donde lo gestiono:

*Dr. Pablo Torrado - Olavarria*
${DOCTURNO_TORRADO_OLA}

*Dr. Pablo Torrado - Bolivar*
${DOCTURNO_TORRADO_BOL}

*Dra. Paula Berney - Consulta general*
${DOCTURNO_BERNEY}

Si usted saco el turno via secretaria, cancelelo o reprogramelo directamente con ella por WhatsApp o llamando al fijo:
WhatsApp: (02284) 594020
Tel fijo: (02284) 416078

Si necesita ayuda para cancelar o reprogramar desde DocTurno, le dejamos esta guia:
${GUIA_CANCELAR_TURNO_URL}` + SECRETARIA_ESCAPE_SIMPLE,

  '4': `*Recetas digitales*

Para continuar, responda:

41. Ya estoy registrado en RCTA
42. Todavia no estoy registrado en RCTA
43. Problemas con el registro de recetas` + SECRETARIA_ESCAPE_SIMPLE,

  '41': `*Recetas digitales - Ya estoy registrado*

Si usted ya esta registrado en RCTA, pida su receta desde el link de su profesional:

*Dra. Paula Berney*
${RCTA_BERNEY_RECETA_URL}

*Dr. Pablo Torrado*
${RCTA_TORRADO_RECETA_URL}

Despues de hacer el pedido, escriba en este chat que medicamento o gota necesita para que podamos seguir el caso.` + SECRETARIA_ESCAPE_SIMPLE,

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

Despues del pedido, escriba en este chat que medicamento o gota necesita.` + SECRETARIA_ESCAPE_SIMPLE,

  '43': `*Problemas con el registro de recetas*

Le dejamos una guia paso a paso para completar el alta en RCTA:
${GUIA_RECETAS_URL}

Si despues de eso sigue con problemas, escriba en este chat:
- nombre y apellido
- medico que lo atiende
- que medicamento o gota necesita
- en que paso del registro se trabo` + SECRETARIA_ESCAPE_SIMPLE,

  '5': `*Factura digital*

Esta funcion estara disponible proximamente.
Por ahora, solicite su factura llamando al (02284) 416078 o escribiendo su nombre completo y DNI y se la enviamos.` + SECRETARIA_ESCAPE_SIMPLE,

  '6': `*Otra consulta*

Consultorio del Dr. Torrado y la Dra. Berney
Vicente Lopez 2061, Olavarria, Buenos Aires
Tel fijo: (02284) 416078
WhatsApp: (02284) 594020

Si su consulta no se encuentra entre las opciones del menu, escriba su mensaje y le responderemos a la brevedad. De lo contrario, escriba *menu* y siga los pasos correspondientes.` + SECRETARIA_ESCAPE,
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
    console.log(`📩 Mensaje de ${from}: "${texto}"`);

    // Si el paciente eligio hablar con la secretaria, solo reaccionar a "menu" o "volver"
    if (esperandoSecretaria.has(from)) {
      const limpio = texto.trim().toLowerCase();
      if (limpio === 'menu' || limpio === 'volver' || limpio === 'volver al menu') {
        esperandoSecretaria.delete(from);
        await whatsapp.sendTextMessage(from, MENU);
        console.log(`✅ ${from} volvio al menu`);
      }
      return;
    }

    const respuesta = obtenerRespuesta(texto);

    // Si eligio opcion 0 o 00, activar modo secretaria
    if (texto.trim() === '0' || texto.trim() === '00') {
      esperandoSecretaria.add(from);
      console.log(`📞 ${from} eligio hablar con la secretaria (opcion ${texto.trim()})`);
    }

    await whatsapp.sendTextMessage(from, respuesta);
    console.log(`✅ Respuesta enviada a ${from}`);
  } catch (err) {
    console.error(`❌ Error procesando mensaje: ${err.message}`);
  }
});

module.exports = router;
