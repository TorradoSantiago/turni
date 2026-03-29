# Roadmap y pendientes — Turni Bot

Consultorio Torrado & Berney | Actualizado 2026-03-28

---

## Estado actual del bot

El bot funciona en el numero de prueba de Meta (no en el numero real todavia).
Recibe mensajes por webhook y responde con menu numerado, sin base de datos.
Hosting: Railway ($5/mes plan Hobby).

Opciones activas:

| Opcion | Descripcion | Tipo |
|--------|-------------|------|
| 1 | Horarios de atencion (Olavarria y Bolivar) | automatico |
| 2 | Sacar turno (links DocTurno) | automatico |
| 3 | Cancelar o reprogramar turno | puede requerir secretaria |
| 4 | Recetas digitales (submenu) | automatico |
| 41 | Ya registrado en RCTA → link de pedido | automatico |
| 42 | Primera vez → registro + pedido | automatico |
| 43 | Problemas con registro RCTA | puede requerir secretaria |
| 5 | Factura digital (pendiente AFIP) | automatico |
| 6 | Otra consulta (datos del consultorio) | automatico |
| 0 | Hablar con la secretaria (detallado, con instrucciones de turno) | requiere secretaria |
| 00 | Hablar con la secretaria (handoff simple) | requiere secretaria |

- Opciones 1, 2, 6 muestran escape `*0*` (con instrucciones para sacar turno via secretaria)
- Opciones 3, 4, 5, 41, 42, 43 muestran escape `*00*` (handoff simple)
- Ambas opciones pausan el bot hasta que el paciente escriba "menu" o "volver"

---

## Pendientes prioritarios

### 1. Migrar al numero real del consultorio
Requiere: planificar con la secretaria, elegir fecha de corte,
avisar a pacientes que el numero pasara a ser atendido por el bot.

### 2. Token de produccion permanente (System User Token de Meta)
El token temporal vence cada pocas horas.
Un System User Token no vence y es mas seguro para produccion.

### 3. Opcion para pacientes nuevos (primera vez en el consultorio)
Muchos pacientes no saben como sacar turno online.
La guia PDF de DocTurno ya existe (Guia-ComoSacarTurno.pdf).
Pendiente: integrarla en la respuesta de la opcion 2.

### 4. Factura digital (opcion 5) — ver seccion AFIP abajo

---

## Mejoras propuestas

**A. Persistencia del modo secretaria**
Hoy el estado vive en RAM: si Railway redeploya, el modo
secretaria se pierde y el paciente vuelve al bot automaticamente.
Solucion: PostgreSQL en Railway para guardar el estado por numero.

**B. Recordatorios automaticos de turno**
24 horas antes del turno, el bot manda un mensaje de recordatorio.
Requiere integracion con la agenda de DocTurno o con un calendario.

**C. Respuesta a lenguaje natural con IA**
Hoy el bot solo entiende numeros.
Con Claude API o Ollama podria entender preguntas abiertas.

**D. Historial de interacciones**
PostgreSQL para saber cuantos pacientes usaron el bot,
que opciones eligieron y cuantos derivaron a la secretaria.

**E. Horarios en tiempo real**
Los horarios son estaticos y estimativos.
Si DocTurno tiene API publica, mostrar huecos disponibles reales.

**F. Opcion especifica para Bolivar**
Dr. Torrado atiende en Bolivar los miercoles.
Se podria ofrecer un submenu con informacion del consultorio Bolivar.

**G. Horario de atencion del bot**
Fuera del horario del consultorio, responder automaticamente
que el consultorio esta cerrado y retomara el proximo dia habil.

---

## AFIP — Facturacion Electronica (pendiente)

Integracion futura para que el bot emita facturas digitales sin que
Pablo tenga que entrar manualmente a la web de AFIP.

**Libreria:** AfipSDK (afip.js) — https://github.com/AfipSDK/afip.js
**Docs:** https://docs.afipsdk.com/

### Que se necesita antes de implementar

1. **CUIT del consultorio** (Pablo tiene que proporcionarlo)

2. **Certificado digital de AFIP**
   - Pablo entra a https://auth.afip.gob.ar con clave fiscal
   - Va a "Administracion de Certificados Digitales"
   - Genera un certificado para este sistema
   - Nos da dos archivos: cert.crt y key.key
   - Esos archivos van en una carpeta /certs (NO se suben a Git)

3. **Tipo de comprobante** (A, B o C)
   - Generalmente profesionales independientes emiten tipo C (monotributo)
     o tipo B (responsable inscripto con consumidores finales)

4. **Instalar la dependencia:** `npm install @afipsdk/afip.js`

### Como va a funcionar

1. Paciente escribe "5" en el bot
2. El bot pide: nombre completo + DNI + monto de la consulta
3. El servicio llama a AFIP, obtiene el CAE (codigo de autorizacion)
4. Genera el PDF de la factura y lo envia por WhatsApp

### Codigo base (para cuando se implemente)

```js
const Afip = require('@afipsdk/afip.js');

const afip = new Afip({
  CUIT: process.env.AFIP_CUIT,
  cert: 'certs/cert.crt',
  key: 'certs/key.key',
  production: process.env.NODE_ENV === 'production',
});

async function emitirFactura({ nombrePaciente, dni, importe }) {
  // TODO: implementar cuando se tenga el certificado AFIP
  throw new Error('Facturacion digital aun no implementada.');
}

module.exports = { emitirFactura };
```

---

## Contacto tecnico

- Repositorio: https://github.com/TorradoSantiago/turni
- Hosting: Railway (plan Hobby, $5/mes)
- Meta app: developers.facebook.com → buscar app Turni
