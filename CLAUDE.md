# TURNI — Bot de WhatsApp para Consultorio Oftalmológico

## Qué es este proyecto
Bot de WhatsApp para el consultorio oftalmológico Torrado & Berney. Recibe mensajes de pacientes vía webhook de Meta Cloud API y responde con un menú numerado. Sin base de datos, sin IA, sin estado — todo en memoria.

## Stack
- **Runtime**: Node.js
- **Framework**: Express
- **HTTP client**: axios (para llamar a la API de Meta)
- **Config**: dotenv

## Arquitectura (3 archivos)
```
src/
  server.js          → Levanta Express, monta rutas
  routes/webhook.js  → GET (verificación Meta) + POST (mensajes entrantes)
  services/whatsapp.js → Envía mensajes vía Meta Cloud API
```

## Cómo funciona
1. Meta recibe un mensaje de WhatsApp y hace POST a `/webhook`
2. `webhook.js` extrae el texto, llama a `obtenerRespuesta()`
3. `obtenerRespuesta()` busca en un objeto de respuestas por número (1-5)
4. Si no matchea ningún número, devuelve el menú principal
5. `whatsapp.js` envía la respuesta vía la API de Meta

## Menú del bot
```
1 → Horarios de atención
2 → Sacar un turno (links a DocTurno para los 3 médicos)
3 → Cancelar un turno (handoff a humano — la secretaria responde por WhatsApp Web)
4 → Factura digital (PENDIENTE — futura integración con AFIP SDK)
5 → Otra consulta (dirección, teléfonos)
```

## Médicos y links de turnos
- **Dr. Pablo Torrado — Oftalmología Infantil (Olavarría)**
  - Agenda: https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&
  - Dirección: Rivadavia 2826, Olavarría, Buenos Aires
  - Teléfono: (02284) 441122

- **Dr. Pablo Torrado — Oftalmología Infantil (Bolívar)**
  - Agenda: https://paciente.docturno.com/agenda/consultorio-medico-belgrano/torrado-pablo-a?originType=medic-page&
  - Dirección: Av. Belgrano, Bolívar, Buenos Aires

- **Dra. Paula Berney — Oftalmología General (Olavarría)**
  - Agenda: https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&
  - Dirección: Rivadavia 2826, Olavarría, Buenos Aires

## Decisiones de diseño
- **Sin submenús**: sin estado guardado, si el usuario escribe "2" no podemos saber si es del menú principal o de un submenú. Los 3 links de turno se mandan juntos.
- **Sin base de datos**: todo en memoria, las respuestas son estáticas.
- **Sin IA por ahora**: respuestas fijas por número, no lenguaje natural.
- **Cancelar = handoff humano**: el bot avisa que alguien lo va a atender, la secretaria responde desde WhatsApp Web.
- **Factura digital**: futura integración con AFIP SDK (https://docs.afipsdk.com/). Hoy Pablo hace la factura electrónica manualmente en la web de AFIP.

## Variables de entorno necesarias (.env)
```
WHATSAPP_TOKEN=           # Token de la app de Meta
WHATSAPP_PHONE_NUMBER_ID= # ID del número de WhatsApp Business
WHATSAPP_VERIFY_TOKEN=    # Token arbitrario para verificar el webhook
PORT=3000
MOCK_WHATSAPP=false       # true para testing local sin Meta
```

## Convenciones de código
- CommonJS (`require`), no ES modules
- Nombres de variables y comentarios en español
- Console.log con emojis para distinguir tipos de log (📩 mensaje, ✅ enviado, ❌ error)
- Funciones simples, sin clases

## Para desarrollo local
1. `npm install`
2. Copiar `.env.example` a `.env` y llenar los valores
3. `npm start` (o `node src/server.js`)
4. En otra terminal, probar con curl:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"5491112345678","type":"text","text":{"body":"2"}}]}}]}]}'
```
5. Para producción: levantar ngrok (`ngrok http 3000`) y registrar la URL en Meta for Developers

## Roadmap
- [ ] Integración AFIP SDK para factura digital automática
- [ ] Base de datos (PostgreSQL) para historial de turnos
- [ ] IA para entender lenguaje natural (Ollama en dev, API en prod)
- [ ] Recordatorios automáticos de turnos
