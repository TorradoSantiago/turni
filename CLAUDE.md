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

> **Dirección del consultorio (ambos):** Vicente López 2061, Olavarría, Buenos Aires
> **Tel fijo:** (02284) 416078 — **WhatsApp:** (02284) 594020

- **Dr. Pablo Torrado — Oftalmología Infantil (Olavarría)**
  - Agenda: https://paciente.docturno.com/agenda/pablo-augusto-torrado/pablo-augusto-torrado?originType=medic-search&
  - Dirección: Vicente López 2061, Olavarría, Buenos Aires
  - Horarios estimativos: Lun 12–17:30, Mar 10:30–17:30, Jue 8–13:30, Vie 8–14

- **Dr. Pablo Torrado — Oftalmología Infantil (Bolívar)**
  - Agenda: https://paciente.docturno.com/agenda/consultorio-medico-belgrano/torrado-pablo-a?originType=medic-page&
  - Dirección: Laprida 156, Bolívar, Buenos Aires
  - Horarios estimativos: Mié 9–15:55

- **Dra. Paula Berney — Oftalmología General (Olavarría)**
  - Agenda: https://paciente.docturno.com/agenda/consultorio-dra-berney-paula/berney-paula-marcela?originType=medic-page&
  - Dirección: Vicente López 2061, Olavarría, Buenos Aires
  - Horarios estimativos: Lun 12–16:20, Mar 9–14:40, Mié 11:20–15:40, Jue 9–15:20, Vie 9–14:40
  - Estudios y cirugías: se agenda por teléfono fijo o WhatsApp (no por DocTurno)

## Decisiones de diseño
- **Sin submenús (Opción A)**: sin estado guardado. Opción 2 muestra toda la info de turnos en un solo mensaje: links de Pablo + para Paula diferencia consulta general (DocTurno) de estudios/cirugía (teléfono directo).
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
