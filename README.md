# Turni — Bot de WhatsApp para el Consultorio Torrado & Berney

> Un bot que responde automáticamente a los pacientes del consultorio oftalmológico.
> Los pacientes escriben un número del 1 al 5 (o 0 para hablar con la secretaría)
> y el bot les manda la info que necesitan al toque, las 24 horas.

---

## Qué hace el bot

Cuando un paciente le escribe al número de WhatsApp del consultorio, recibe este menú:

```
1 — Horarios de atención
2 — Sacar un turno        ← link directo a DocTurno
3 — Cancelar un turno     ← deriva a la secretaría
4 — Factura digital       ← próximamente automático
5 — Dirección y contacto
0 — Hablar con la secretaría
```

El paciente escribe el número y recibe la respuesta en segundos.
Sin que nadie del consultorio tenga que estar mirando el teléfono.

---

## Estructura del proyecto

```
turni/
├── src/
│   ├── server.js              ← Arranca el servidor (punto de entrada)
│   ├── routes/
│   │   └── webhook.js         ← Recibe mensajes y decide qué responder
│   └── services/
│       ├── whatsapp.js        ← Envía mensajes via API de Meta
│       └── afip.js            ← Futura facturación automática (pendiente)
├── test.js                    ← Simula mensajes para probar sin WhatsApp real
├── .env                       ← Credenciales privadas (NO se sube a GitHub)
├── .env.example               ← Plantilla del .env (sí se sube, sin datos reales)
└── flow-bot.html              ← Diagrama visual del flujo del bot
```

**Cómo fluye un mensaje:**
1. El paciente escribe en WhatsApp
2. Meta envía ese mensaje a `/webhook` de nuestro servidor
3. `webhook.js` lee el texto, busca la respuesta y la envía via `whatsapp.js`
4. El paciente recibe la respuesta en segundos

---

## Cómo correrlo en tu compu (modo desarrollo)

### 1. Clonar e instalar
```bash
git clone https://github.com/TorradoSantiago/turni.git
cd turni
npm install
```

### 2. Configurar credenciales
Copiá `.env.example` a `.env` y completá los valores:
```
WHATSAPP_TOKEN=           ← Token de la app en Meta for Developers
WHATSAPP_PHONE_NUMBER_ID= ← ID del número de WhatsApp Business
WHATSAPP_VERIFY_TOKEN=    ← Contraseña arbitraria para verificar el webhook
PORT=3000
MOCK_WHATSAPP=false       ← Poné true para probar sin Meta
```

### 3. Probar sin WhatsApp real (recomendado para empezar)
```bash
# En una terminal: levantá el servidor
MOCK_WHATSAPP=true node src/server.js

# En otra terminal: enviá mensajes de prueba
node test.js
```

Vas a ver las respuestas del bot directamente en la consola, sin necesitar credenciales.

### 4. Probar con WhatsApp real (modo producción local)
```bash
# Terminal 1: servidor
node src/server.js

# Terminal 2: túnel ngrok (exponé el puerto a internet)
ngrok http 3000
```

Copiá la URL de ngrok (ej: `https://abc123.ngrok-free.dev`) y configurala como
webhook en Meta for Developers → tu app → WhatsApp → Configuración → Webhook.

---

## Cómo desplegarlo en producción (Railway)

Para que el bot funcione 24/7 sin tener la compu encendida,
el código se despliega en [Railway](https://railway.app):

1. Entrá a **railway.app** → Login with GitHub
2. **New Project** → **Deploy from GitHub repo** → elegí `turni`
3. Agregá las variables de entorno en la sección **Variables** (las mismas del `.env`)
4. Railway te da una URL pública permanente (ej: `turni.up.railway.app`)
5. Actualizá esa URL en el webhook de Meta → listo

Cada vez que hagas `git push`, Railway actualiza el bot automáticamente.

---

## Seguridad

Este bot está diseñado para ser simple y seguro. Esto es lo que lo protege:

### Lo que ya tiene
- **Sin base de datos**: el bot no guarda ningún dato de los pacientes.
  No hay historial, no hay nombres, no hay DNIs almacenados. Nada que robar.
- **Verificación del webhook**: antes de procesar cualquier mensaje, el bot
  verifica que sea de Meta usando el `WHATSAPP_VERIFY_TOKEN`. Mensajes de
  otras fuentes son rechazados automáticamente.
- **Credenciales fuera del código**: el token de acceso y demás claves viven
  en el `.env`, que está en el `.gitignore`. Nunca se suben a GitHub.
- **HTTPS obligatorio**: Meta solo acepta webhooks con HTTPS. Tanto ngrok
  como Railway usan HTTPS por defecto.
- **Sin ejecución de código externo**: el bot solo mapea números (1, 2, 3...)
  a textos fijos. No ejecuta nada que venga del paciente.

### Buenas prácticas para mantenerlo seguro
- **No compartir el `.env`**: si alguien tiene el `WHATSAPP_TOKEN`, puede
  enviar mensajes en nombre del consultorio. Tratarlo como una contraseña.
- **Regenerar el token si se filtra**: en Meta for Developers → tu app →
  WhatsApp → generar nuevo token.
- **No subir `.env` a GitHub**: ya está en `.gitignore`, pero ojo si se
  crea un repo nuevo o se clonan archivos manualmente.
- **Variables de entorno en Railway**: en producción, las credenciales van
  en el panel de Railway, nunca en el código.

### Lo que NO tiene (y por qué no es un problema ahora)
- **Rate limiting**: no limita cuántos mensajes puede mandar una persona.
  No es un problema para el volumen de un consultorio. Se puede agregar si
  escala.
- **Autenticación de pacientes**: cualquiera que tenga el número puede
  escribir. Por el momento está bien — es un servicio público de info.

---

## Variables de entorno

| Variable | Para qué sirve | Dónde conseguirla |
|---|---|---|
| `WHATSAPP_TOKEN` | Token de acceso a la API de Meta | Meta for Developers → tu app → WhatsApp |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número de WhatsApp Business | Meta for Developers → tu app → WhatsApp |
| `WHATSAPP_VERIFY_TOKEN` | Contraseña para verificar el webhook | Inventala vos, tiene que coincidir con Meta |
| `PORT` | Puerto del servidor | Default: 3000 |
| `MOCK_WHATSAPP` | `true` para testear sin Meta | Solo para desarrollo |

---

## Lo que viene

- [ ] **Factura digital automática** — integración con AFIP SDK
- [ ] **Recordatorios de turno** — mensaje automático el día anterior
- [ ] **Lenguaje natural** — que el bot entienda frases, no solo números
- [ ] **Base de datos** — para guardar historial de consultas (cuando escale)

---

## Créditos

Desarrollado por **Santiago Torrado** para el consultorio oftalmológico familiar.

Tecnologías: Node.js · Express · WhatsApp Cloud API (Meta) · Railway
