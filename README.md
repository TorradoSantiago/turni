# 🤖 Turni — Bot de WhatsApp para Consultorio Oftalmológico

Bot de WhatsApp para el consultorio Torrado & Berney (Olavarría). Responde consultas de pacientes con un menú numerado: horarios, turnos, recetas digitales y más.

Sin base de datos, sin IA, sin complejidad innecesaria. Todo en memoria.

---

## 💬 Qué hace

Cuando un paciente escribe al número del consultorio, recibe este menú:

```
0. Hablar con la secretaria
1. Horarios de atención
2. Sacar un turno
3. Cancelar o reprogramar turno
4. Recetas digitales
5. Factura digital
6. Problemas con el registro de recetas
7. Otra consulta
```

La opción 4 despliega un submenú:
- `41` → ya estoy registrado en RCTA, quiero pedir una receta
- `42` → todavía no me registré en RCTA

La opción `0` activa el modo secretaria: el bot se silencia y la secretaria responde directamente. El paciente escribe **"volver"** o **"menu"** para retomar el bot.

---

## 🗂️ Estructura

```
src/
  server.js              → levanta Express
  routes/webhook.js      → verifica el webhook y procesa mensajes
  services/whatsapp.js   → envía respuestas a Meta Cloud API
scripts/
  html-to-pdf.js         → regenera los PDFs (requiere npm install)
Guia - Registro Recetas RCTA.pdf  → guía para pacientes con RCTA
Turni - Guia del Consultorio.pdf  → guía para el consultorio y la secretaria
Roadmap y Pendientes.pdf          → estado del proyecto
```

---

## ⚙️ Variables de entorno

```env
WHATSAPP_TOKEN=           # token de acceso de Meta
WHATSAPP_PHONE_NUMBER_ID= # ID del número de WhatsApp Business
WHATSAPP_VERIFY_TOKEN=    # token que vos elegís para verificar el webhook
WHATSAPP_GRAPH_VERSION=v25.0
PORT=3000
MOCK_WHATSAPP=false       # true para probar localmente sin Meta
```

---

## 🚀 Desarrollo local

```bash
npm install
cp .env.example .env   # o copy en Windows
npm start
```

Para probar sin Meta:

```env
MOCK_WHATSAPP=true
```

```bash
node test.js
```

---

## ☁️ Deploy en Railway

1. Subí el repo a GitHub
2. En Railway, creá un proyecto desde ese repo
3. Railway ejecuta `npm start` automáticamente
4. Generá un dominio público para el servicio
5. Cargá las variables de entorno en `Variables → Raw Editor`
6. Conectá el webhook de Meta con `https://tu-dominio.up.railway.app/webhook`
7. Suscribite al campo `messages` en los webhooks de Meta

> Ver `guia-consultorio.html` o el PDF correspondiente para instrucciones visuales paso a paso.

---

## 🗺️ Roadmap

- [ ] Integración AFIP SDK para factura digital automática
- [ ] Token permanente de Meta (el actual expira cada 24h en dev)
- [ ] Migración al número real del consultorio
- [ ] Base de datos si el flujo crece
- [ ] Soporte para lenguaje natural (LLM local con Ollama)

---

## 🛠️ Stack

- **Node.js + Express** — servidor y webhook
- **WhatsApp Cloud API** — mensajería
- **Railway** — deploy y hosting
- **Puppeteer** — generación de PDFs desde HTML
