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

const MENU = `Hola. Soy Turni, el asistente del consultorio del Dr. Torrado y la Dra. Berney.
En que te puedo ayudar? Estoy aqui para ayudarte con turnos, recetas y consultas generales.
El funcionamiento es simple: solo escriba el numero de lo que necesita.:

1. Horarios de atencion
2. Sacar un turno
3. Cancelar o reprogramar turno
4. Recetas digitales
5. Factura digital
6. Otra consulta`;

const SECRETARIA_ESCAPE = `\n\nSi prefiere hablar con la secretaria, responda *0*`;

const RESPUESTAS = {
  '0': `*Hablar con la secretaria*

Si la consulta es para solicitar un turno porque no lo pudo hacer de manera online, por favor chequee la guia de registro en Docturno
en este link ${GUIA_SACAR_TURNO_URL}. Si aun no puede sacar y quiere que la secretaria le saque el turno, siga estos pasos:

1) *Chequee la disponibilidad de turnos y horarios*: ingrese a este link para el Dr. Torrado https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&
o a este link para la Dra. Berney https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&

2) *Escriba en este chat*: el turno que quiere sacar dentro de los disponibles e informenos
  - Fecha, hora y profesional
  - Su nombre y apellido completo
  - DNI
  - Fecha de nacimiento.

Luego de completar estos datos le agendaremos el turno y se lo confirmaremos por este mismo chat.
La secretaria le va a responder a la brevedad.

Si prefiere llamar directamente: Tel fijo: (02284) 416078

Cuando quiera volver al menu automatico, escriba *menu*.`,

  '1': `*Horarios de atencion*

Los horarios son estimativos. Para ver disponibilidad real, pedi turno online.

*Dr. Pablo Torrado - Oftalmologia Infantil*

Olavarria - Vicente Lopez 2061
- Lunes: 11:30 a 17:30 hs
- Martes: 10:30 a 17:30 hs
- Jueves: 08:00 a 13:30 hs y de 17:15 hs a 19:30 hs
- Viernes: 08:00 a 13:30 hs

Bolivar - Laprida 156
- Miercoles: 09:00 a 16:00 hs

*Dra. Paula Berney - Oftalmologia General*

Olavarria - Vicente Lopez 2061
- Lunes: 12:00 a 16:20 hs
- Martes: 09:00 a 14:40 hs
- Miercoles: 11:20 a 15:40 hs
- Jueves: 09:00 a 15:20 hs
- Viernes: 09:00 a 14:40 hs` + SECRETARIA_ESCAPE,

  '2': `*Sacar un turno*

Si desea sacar un turno online, elija el link de su profesional y ciudad, tambien encontrara
un pdf con instrucciones detalladas si tiene algun inconveniente con el registro en doctuno:
${GUIA_SACAR_TURNO_URL}

*Dr. Pablo Torrado - Oftalmologia Infantil (de 0 a 18 años)*

Olavarria:
https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&

Bolivar:
https://paciente.docturno.com/agenda/consultorio-medico-belgrano/torrado-pablo-a?originType=medic-page&

------------------------------

*Dra. Paula Berney - Oftalmologia General (mayores de 18 años)*

Consulta general (no para estudios ni cirugias):
https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&

*Por consultas sobre estudios o cirugias:* comunicarse directamente directamente con la secretaria
presionando 0` + SECRETARIA_ESCAPE,

  '3': `*Cancelar o reprogramar turno*

Si usted saco el turno online con el Dr. Torrado o la Dra. Berney, puede cancelarlo o reprogramarlo
Directamente desde este link https://paciente.docturno.com/turnos. Si tiene algun inconveniente le
dejamos un pdf con instrucciones detalladas.
${GUIA_CANCELAR_TURNO_URL}

Si usted saco el turno via secretaria, cancelelo o reprogramelo directamente con ella
presionando 0` + SECRETARIA_ESCAPE,

  '4': `*Solicitar una receta*

RCTA es nuestro sistema de recetas digitales. Para continuar, responda:

41. Ya he solicitado recetas digitales y estoy registrado en RCTA
42. Todavia no he solicitado recetas digitales o no estoy registrado en RCTA

Si tiene problemas con el registro, responda con 43 y le enviamos una guia paso a paso.` + SECRETARIA_ESCAPE,

  '41': `*Recetas digitales - Ya estoy registrado*

Si usted ya esta registrado en RCTA, pida su receta desde el link de su profesional:

*Dra. Paula Berney*
${RCTA_BERNEY_RECETA_URL}

*Dr. Pablo Torrado*
${RCTA_TORRADO_RECETA_URL}

Despues de hacer el pedido, escriba su nombre y apellido completo
y que medicamento o gota necesita en este chat asi aceptamos su solicitud.` + SECRETARIA_ESCAPE,

  '42': `*Recetas digitales - Todavia no estoy registrado*

Primero debe registrarse en RCTA con el link de su profesional:

*Dra. Paula Berney*
${RCTA_BERNEY_URL}

*Dr. Pablo Torrado*
${RCTA_TORRADO_URL}

Una vez registrado, pida su receta desde el link de su profesional:

*Dra. Paula Berney*
${RCTA_BERNEY_RECETA_URL}

*Dr. Pablo Torrado*
${RCTA_TORRADO_RECETA_URL}

Despues de hacer el pedido, escriba su nombre y apellido completo
y que medicamento o gota necesita en este chat asi aceptamos su solicitud.` + SECRETARIA_ESCAPE,

  '5': `*Factura digital*

Solicite su factura escribiendo su nombre y apellido completo, DNI y el profesional con el
que fue atendido y le enviaremos la factura.` + SECRETARIA_ESCAPE,

  '6': `*Contacto y direccion*

Consultorio del Dr. Torrado y la Dra. Berney
Vicente Lopez 2061, Olavarria, Buenos Aires
Tel fijo: (02284) 416078
WhatsApp - Solo mensajes: (02284) 594020

Para cualquier otra consulta, escriba su mensaje y le responderemos a la brevedad.` + SECRETARIA_ESCAPE,

  '43': `*Problemas con el registro de recetas*

Le dejamos una guia paso a paso para completar el alta en RCTA:
${GUIA_RECETAS_URL}

Si despues de eso sigue con problemas, escriba en este chat:
- nombre y apellido
- medico que lo atiende
- que medicamento o gota necesita
- en que paso del registro se trabo` + SECRETARIA_ESCAPE,

  '7': `*Contacto y direccion*

Consultorio del Dr. Torrado y la Dra. Berney
Vicente Lopez 2061, Olavarria, Buenos Aires
Tel fijo: (02284) 416078
WhatsApp - Solo mensajes: (02284) 594020

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
