# Turni - Bot de WhatsApp para Consultorio Oftalmologico

Bot de WhatsApp para el consultorio Torrado & Berney (Olavarria). Responde consultas de pacientes con un menu numerado para horarios, turnos, recetas digitales, facturacion y contacto.

La idea del proyecto sigue siendo la misma: sin base de datos, sin IA y sin complejidad innecesaria. El estado conversacional vive en memoria.

---

## Estado actual

- Menu principal con opciones `1` a `6`
- Escape a secretaria con opcion `0`
- Submenu de recetas con opciones `41`, `42` y `43`
- Comandos `menu`, `volver` y `volver al menu` para salir de estados activos
- Modo mock para probar sin credenciales reales de Meta
- Guias PDF para sacar turno, cancelar turno y registrarse en RCTA

---

## Flujo del bot

Cuando llega un mensaje de texto nuevo, el bot responde con este menu principal:

```text
1. Horarios de atencion
2. Sacar un turno
3. Cancelar o reprogramar turno
4. Recetas digitales
5. Factura digital
6. Otra consulta
```

Ademas, en las respuestas operativas el bot ofrece escribir `0` para hablar con la secretaria.

### Opciones disponibles

- `0`: activa el modo secretaria. Desde ese momento el bot deja de responder hasta que el paciente escriba `menu`, `volver` o `volver al menu`.
- `1`: devuelve horarios estimativos del Dr. Torrado y la Dra. Berney.
- `2`: comparte links de Docturno para sacar turno y la guia `Guia-ComoSacarTurno.pdf`.
- `3`: comparte el link de Docturno para cancelar o reprogramar y la guia `Guia-CancelarTurno-v2.pdf`.
- `4`: abre el submenu de recetas digitales.
- `5`: explica como solicitar la factura digital por chat.
- `6`: envia datos de contacto, direccion y deja abierta la consulta manual.

### Submenu de recetas

La opcion `4` abre este submenu:

- `41`: paciente ya registrado en RCTA y listo para pedir receta.
- `42`: paciente todavia no registrado en RCTA; comparte link de alta y link para pedir receta.
- `43`: envia la guia paso a paso `Guia - Registro Recetas RCTA.pdf`.

### Comportamiento conversacional actual

- Si el paciente escribe `41`, `42` o `43` sin haber entrado antes por `4`, el bot primero reenvia el submenu de recetas.
- Si el paciente escribe `menu`, `volver` o `volver al menu`, el bot sale tanto del modo secretaria como del submenu de recetas y vuelve al menu principal.
- Si llega un mensaje que no es texto, el bot responde con el menu principal o con el submenu de recetas segun el estado actual.
- Si el paciente esta en modo secretaria, el bot queda en silencio hasta que reciba un comando de regreso al menu.
- El estado se guarda solo en memoria con `Set`, asi que un reinicio del proceso limpia las conversaciones activas.

---

## Endpoints

- `GET /`: health check simple para confirmar que el servidor esta levantado.
- `GET /webhook`: verificacion del webhook de Meta usando `hub.verify_token`.
- `POST /webhook`: procesa mensajes entrantes de WhatsApp Cloud API.

---

## Estructura

```text
src/
  server.js              -> levanta Express, parsea JSON y expone / y /webhook
  routes/webhook.js      -> verifica el webhook y maneja el flujo conversacional
  services/whatsapp.js   -> envia mensajes a Meta Cloud API o imprime en mock
scripts/
  html-to-pdf.js         -> regenera PDFs a partir de HTML
test/
  test-local.sh          -> smoke test local del webhook y del flujo conversacional

README.md                           -> documentacion operativa y roadmap vivo del proyecto
Guia - Registro Recetas RCTA.pdf  -> guia para alta en RCTA
Guia-ComoSacarTurno.pdf           -> guia para sacar turno online
Guia-CancelarTurno-v2.pdf         -> guia para cancelar o reprogramar turno
Turni - Guia del Consultorio.pdf  -> guia operativa para consultorio y secretaria
```

---

## Variables de entorno

```env
WHATSAPP_TOKEN=           # token de acceso de Meta
WHATSAPP_PHONE_NUMBER_ID= # ID del numero de WhatsApp Business
WHATSAPP_VERIFY_TOKEN=    # token elegido para verificar el webhook
WHATSAPP_GRAPH_VERSION=v25.0
PORT=3000
MOCK_WHATSAPP=false       # true para probar localmente sin Meta
```

Notas:

- `WHATSAPP_GRAPH_VERSION` usa `v25.0` por default.
- El servicio sanitiza variables con espacios o comillas accidentales en el `.env`.
- Si Meta devuelve el error `131030` para un numero argentino con prefijo `549`, el servicio reintenta automaticamente usando `54` sin el `9` movil.

---

## Desarrollo local

```bash
npm install
cp .env.example .env
npm start
```

En PowerShell:

```powershell
Copy-Item .env.example .env
npm start
```

El servidor queda disponible en:

- `http://localhost:3000/`
- `http://localhost:3000/webhook`

---

## Mock y pruebas locales

Para probar sin credenciales reales de Meta:

```env
MOCK_WHATSAPP=true
```

En bash:

```bash
MOCK_WHATSAPP=true npm start
bash test/test-local.sh
```

En PowerShell:

```powershell
$env:MOCK_WHATSAPP = "true"
npm start
```

La suite `test/test-local.sh` cubre:

- menu principal
- submenu de recetas `41`, `42`, `43`
- salida con `volver`
- modo secretaria con `0` y regreso con `menu`
- mensajes no texto
- verificacion `GET /webhook`

El script no reemplaza tests automatizados formales; hoy funciona como smoke test manual del flujo principal.

---

## Deploy en Railway

1. Sube el repo a GitHub.
2. Crea un proyecto en Railway desde ese repo.
3. Railway ejecuta `npm start` automaticamente.
4. Genera un dominio publico para el servicio.
5. Carga las variables de entorno en `Variables -> Raw Editor`.
6. Configura en Meta el webhook `https://tu-dominio.up.railway.app/webhook`.
7. Usa el mismo valor de `WHATSAPP_VERIFY_TOKEN` para validar el webhook.
8. Suscribete al campo `messages` en la configuracion de webhooks de Meta.

Para soporte operativo del consultorio, usar tambien:

- `Turni - Guia del Consultorio.pdf`
- `Guia-ComoSacarTurno.pdf`
- `Guia-CancelarTurno-v2.pdf`

---

## Limitaciones actuales

- No hay base de datos ni persistencia.
- No hay panel de administracion.
- `npm test` todavia no ejecuta una suite real.
- Todo el flujo esta pensado para mensajes de texto simples.

---

## Roadmap

- [ ] Integracion AFIP SDK para factura digital automatica
- [ ] Token permanente de Meta
- [ ] Migracion al numero real del consultorio
- [ ] Persistencia si el flujo crece
- [ ] Tests automatizados reales

---

## Stack

- Node.js
- Express
- Axios
- WhatsApp Cloud API
- Railway
- Puppeteer
