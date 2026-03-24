# Turni - Bot de WhatsApp para el Consultorio Torrado & Berney

Bot simple de WhatsApp para consultorio. Recibe mensajes por webhook de Meta Cloud API y responde con un menu numerado.

## Que hace

Cuando una persona escribe al numero conectado al bot, recibe este menu:

```text
1. Horarios de atencion
2. Sacar un turno
3. Cancelar un turno
4. Factura digital
5. Otra consulta
```

El proyecto no usa base de datos ni IA. Todo el contenido esta hardcodeado para mantenerlo simple.

## Estructura

```text
src/
  server.js             -> arranca Express
  routes/webhook.js     -> verifica el webhook y procesa mensajes entrantes
  services/whatsapp.js  -> envia respuestas a Meta Cloud API
  services/afip.js      -> stub futuro para facturacion
test.js                 -> prueba local manual
```

## Requisitos

- Node.js 18 o superior
- Una app en Meta for Developers con WhatsApp Cloud API
- Un deploy publico, por ejemplo Railway

## Instalacion local

```bash
npm install
copy .env.example .env
npm start
```

Tambien podes probar sin Meta activando mock:

```env
MOCK_WHATSAPP=true
```

Y luego:

```bash
node test.js
```

## Variables de entorno

No uses comillas en Railway ni en `.env`.

```env
WHATSAPP_TOKEN=tu_token_de_meta
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_VERIFY_TOKEN=un_token_que_vos_inventas
WHATSAPP_GRAPH_VERSION=v25.0
PORT=3000
MOCK_WHATSAPP=false
```

## Deploy en Railway

1. Subi el repo a GitHub.
2. En Railway, crea un proyecto desde GitHub.
3. Railway va a ejecutar `npm start`, que levanta `node src/server.js`.
4. Genera un dominio publico para el servicio.
5. Carga estas variables en `Variables` o `Raw Editor`:

```env
MOCK_WHATSAPP=false
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_TOKEN=tu_token_de_meta
WHATSAPP_VERIFY_TOKEN=turni-webhook-2024
WHATSAPP_GRAPH_VERSION=v25.0
```

6. Hace `Update Variables` y despues `Deploy`.

## Conectar Meta Developers con el numero de prueba

### 1. Crear la app

1. Entra a Meta for Developers.
2. Crea una app de tipo Business.
3. Agrega el producto WhatsApp.
4. En `Configuracion de la API`, usa el numero de prueba que te da Meta.

### 2. Copiar los datos correctos

En `Configuracion de la API`, copia:

- `Token de acceso` -> va en `WHATSAPP_TOKEN`
- `Identificador de numero de telefono` -> va en `WHATSAPP_PHONE_NUMBER_ID`

No pongas esos valores dentro del codigo. Solo van en variables.

### 3. Agregar tu numero como destinatario de prueba

En la seccion `Enviar y recibir mensajes`:

1. En `Para`, agrega tu numero personal.
2. Verificalo si Meta te lo pide.
3. Usa exactamente el numero que despues va a escribirle al bot.

Nota para Argentina:

- Si Meta da error `(#131030) Recipient phone number not in allowed list`, revisa el formato del numero autorizado.
- Muchas veces Meta acepta mejor el numero sin el `9` movil en la lista de prueba.
- Ejemplo:
  - en vez de `+54 9 2284 51 1188`
  - probar `+54 2284 51 1188`

El codigo actual tambien hace un reintento automatico sin el `9` para numeros de Argentina cuando Meta rechaza el formato movil.

### 4. Configurar el webhook

En `Configuracion` dentro de WhatsApp:

1. En `URL de devolucion de llamada`, pon:

```text
https://tu-dominio-publico.up.railway.app/webhook
```

2. En `Token de verificacion`, pon el mismo valor de `WHATSAPP_VERIFY_TOKEN`.
3. Deja apagado `Adjunta un certificado de cliente`.
4. Hace click en `Verificar y guardar`.

### 5. Suscribirse al campo correcto

En la lista de campos del webhook, suscribite al campo:

- `messages`

Sin eso, Meta puede verificar el webhook pero no enviarte los mensajes reales.

## Como testear el bot con el numero de prueba de Meta

1. En Meta, desde `Configuracion de la API`, usa `Enviar mensaje` para comprobar que el numero de prueba puede escribirle a tu celular.
2. Desde tu WhatsApp personal, responde a ese numero de prueba.
3. Railway deberia recibir el webhook y el bot deberia contestarte.

Flujo esperado:

1. Meta envia `Hello World` al numero autorizado.
2. Vos respondes `Hola`.
3. Railway recibe el mensaje.
4. El bot responde con el menu.

## Logs utiles en Railway

Si algo falla, entra a `View logs` en Railway y busca estas lineas:

- `Mensaje de ...`
- `Error enviando mensaje a Meta`
- `status: ...`
- `data: ...`
- `message: ...`

Eso te permite distinguir rapidamente si el problema es:

- token invalido
- `phone_number_id` incorrecto
- webhook mal configurado
- numero no autorizado en Meta
- formato argentino del destinatario

## Problemas comunes

### El webhook verifica pero el bot no responde

Probablemente falta suscribirse al campo `messages` o el deploy no tomo las variables nuevas.

### Error 400 en Railway

Mira `data:` en los logs. Meta devuelve el motivo exacto.

### Error `Recipient phone number not in allowed list`

El webhook anda, pero Meta no te deja responderle a ese numero. Revisa la lista de destinatarios de prueba y el formato del numero.

### El token cambio en Meta

Actualiza `WHATSAPP_TOKEN` en Railway y redeploya. Tu `.env` local no actualiza Railway.

### En Railway las variables aparecen entre comillas

El codigo actual las sanea, pero igual conviene guardarlas sin comillas para evitar confusion.

## Desarrollo

Comandos utiles:

```bash
npm start
node test.js
```

## Roadmap

- Factura digital via AFIP
- Persistencia de datos si el flujo crece
- Mejoras de contenido y menu

