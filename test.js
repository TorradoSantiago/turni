// Script de prueba — simula mensajes de WhatsApp sin necesitar Meta
// Uso: node test.js

const http = require('http');

const mensajes = ['hola', '1', '2', '3', '4', '5', 'asdfgh'];

function enviarMensaje(texto) {
  return new Promise((resolve, reject) => {
    const datos = JSON.stringify({
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '5491112345678',
              type: 'text',
              text: { body: texto }
            }]
          }
        }]
      }]
    });

    const opciones = {
      hostname: 'localhost',
      port: 3000,
      path: '/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': datos.length,
      },
    };

    const req = http.request(opciones, (res) => {
      resolve(res.statusCode);
    });

    req.on('error', (e) => reject(e));
    req.write(datos);
    req.end();
  });
}

async function correrTests() {
  console.log('🧪 Probando el bot...\n');
  console.log('(Asegurate de tener el servidor corriendo con npm start en otra terminal)\n');

  for (const msg of mensajes) {
    try {
      const status = await enviarMensaje(msg);
      console.log(`✅ Enviado "${msg}" → servidor respondió ${status}`);
    } catch (e) {
      console.log(`❌ Error enviando "${msg}": ${e.message}`);
      console.log('   ¿Está corriendo el servidor? (npm start en otra terminal)');
      return;
    }
    // Esperar un poco entre mensajes
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n🎉 ¡Todos los tests pasaron! Mirá la otra terminal para ver las respuestas del bot.');
}

correrTests();
