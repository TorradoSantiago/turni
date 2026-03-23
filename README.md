# 🤖 Turni — Bot de WhatsApp para el Consultorio Torrado & Berney

> Un bot de WhatsApp que responde automáticamente a los pacientes del consultorio oftalmológico. Los pacientes escriben un número del 1 al 5 y el bot les manda la info que necesitan al toque.

---

## 🏥 ¿Qué hace el bot?

Cuando un paciente le escribe al número de WhatsApp del consultorio, el bot responde con un menú:

```
1️⃣ Horarios de atención
2️⃣ Sacar un turno
3️⃣ Cancelar un turno
4️⃣ Factura digital
5️⃣ Otra consulta
```

El paciente escribe el número y el bot responde automáticamente con la info correspondiente. Sin necesidad de que nadie esté mirando el teléfono.

---

## 🗂️ ¿Cómo está armado?

Solo 3 archivos que importan:

| Archivo | ¿Qué hace? |
|---|---|
| `src/server.js` | Levanta el servidor y lo pone a escuchar mensajes |
| `src/routes/webhook.js` | Recibe los mensajes y decide qué responder |
| `src/services/whatsapp.js` | Envía las respuestas a través de la API de Meta |

Y uno extra para el futuro:

| Archivo | ¿Qué hace? |
|---|---|
| `src/services/afip.js` | (Todavía no funciona) Va a emitir facturas automáticas |

---

## 🚀 ¿Cómo lo arranco en mi compu?

### 1. Instalá las dependencias
```bash
npm install
```

### 2. Configurá las variables de entorno
Copiá el archivo `.env.example` a `.env` y completá los valores:
```
WHATSAPP_TOKEN=           ← Token de Meta
WHATSAPP_PHONE_NUMBER_ID= ← ID del número de WhatsApp Business
WHATSAPP_VERIFY_TOKEN=    ← Contraseña arbitraria para verificar el webhook
PORT=3000
MOCK_WHATSAPP=false       ← Poné true para testear sin Meta
```

### 3. Levantá el servidor
```bash
node src/server.js
```

Deberías ver esto:
```
🚀 Servidor escuchando en puerto 3000
```

### 4. Probalo localmente (sin WhatsApp real)
```bash
node test.js
```

Esto simula mensajes y muestra cómo respondería el bot.

---

## 🌐 ¿Cómo lo conecto a WhatsApp real?

El bot tiene que estar en internet para que Meta le pueda mandar los mensajes. Para eso usamos **ngrok** — una herramienta que crea un túnel entre internet y tu compu.

### Paso 1 — Levantá ngrok
Con el servidor corriendo en una terminal, abrí otra y ejecutá:
```bash
ngrok http 3000
```

Vas a ver algo así:
```
Forwarding  https://algo-random.ngrok-free.dev → http://localhost:3000
```

Copiá esa URL (la que empieza con `https://`).

### Paso 2 — Configurá el webhook en Meta
1. Entrá a [developers.facebook.com](https://developers.facebook.com/apps/)
2. Abrí la app **Turni**
3. Ir a **WhatsApp → Configuración**
4. En **Webhook**, pegá: `https://tu-url-de-ngrok.ngrok-free.dev/webhook`
5. En **Token de verificación**: `turni-webhook-2024`
6. Hacé click en **Verificar y guardar**

### Paso 3 — Agregate como destinatario de prueba
En la consola de Meta, agregá tu número de WhatsApp personal como número de prueba. Así podés enviarte mensajes desde el número del consultorio.

---

## 🧪 Probalo en tu WhatsApp

Una vez conectado:
1. Mandá un mensaje cualquiera al número del consultorio desde tu celu
2. El bot te debería responder con el menú en segundos
3. Respondé con `1`, `2`, `3`, `4` o `5` para probar cada opción

---

## 📋 Variables de entorno necesarias

| Variable | Para qué sirve |
|---|---|
| `WHATSAPP_TOKEN` | Token de acceso de la app de Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número de WhatsApp Business |
| `WHATSAPP_VERIFY_TOKEN` | Token para verificar el webhook (cualquier texto) |
| `PORT` | Puerto del servidor (default: 3000) |
| `MOCK_WHATSAPP` | `true` para testear sin Meta, `false` para producción |

---

## 🔮 Lo que viene

- [ ] **Factura digital automática** — integración con AFIP para emitir facturas sin hacer nada manual
- [ ] **Base de datos** — guardar historial de consultas y turnos
- [ ] **Lenguaje natural** — que el bot entienda "quiero sacar un turno" además de solo números
- [ ] **Recordatorios** — que mande un mensaje automático el día antes del turno

---

## 👨‍💻 Hecho por

Santiago Torrado — Primer proyecto de automatización para el consultorio familiar.

> *"El mejor código es el que ahorra trabajo sin que nadie se dé cuenta."*
