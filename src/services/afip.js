/**
 * AFIP — Facturación Electrónica
 *
 * Este módulo va a usar AfipSDK (afip.js) para emitir facturas digitales
 * sin que Pablo tenga que entrar manualmente a la web de AFIP.
 *
 * Librería: https://github.com/AfipSDK/afip.js
 * Docs:     https://docs.afipsdk.com/
 *
 * ESTADO: pendiente de implementación
 *
 * ─── QUÉ SE NECESITA ANTES DE IMPLEMENTAR ───────────────────────────────────
 *
 * 1. CUIT del consultorio (Pablo tiene que proporcionarlo)
 *
 * 2. Certificado digital de AFIP
 *    - Pablo tiene que entrar a https://auth.afip.gob.ar con clave fiscal
 *    - Ir a "Administración de Certificados Digitales"
 *    - Generar un certificado para este sistema
 *    - Nos da dos archivos: cert.crt y key.key
 *    - Esos archivos van en una carpeta /certs (NO se suben a Git)
 *
 * 3. Tipo de comprobante habitual del consultorio (A, B o C)
 *    - Generalmente profesionales independientes emiten tipo C (monotributo)
 *      o tipo B (responsable inscripto con consumidores finales)
 *
 * 4. Instalar la dependencia: npm install @afipsdk/afip.js
 *    (agregar a package.json)
 *
 * ─── CÓMO VA A FUNCIONAR ─────────────────────────────────────────────────────
 *
 * Flujo previsto:
 *   1. Paciente escribe "4" en el bot
 *   2. El bot pide: nombre completo + DNI + monto de la consulta
 *   3. Este servicio llama a AFIP, obtiene el CAE (código de autorización)
 *   4. Genera el PDF de la factura y lo envía por WhatsApp
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// const Afip = require('@afipsdk/afip.js');

// const afip = new Afip({
//   CUIT: process.env.AFIP_CUIT,
//   cert: 'certs/cert.crt',
//   key: 'certs/key.key',
//   production: process.env.NODE_ENV === 'production',
// });

/**
 * Emite una factura electrónica para un paciente.
 * @param {object} datos
 * @param {string} datos.nombrePaciente
 * @param {string} datos.dni
 * @param {number} datos.importe  - en pesos, sin decimales
 * @returns {Promise<{cae: string, vencimientoCae: string, nroComprobante: number}>}
 */
async function emitirFactura({ nombrePaciente, dni, importe }) {
  // TODO: implementar cuando se tenga el certificado AFIP
  throw new Error('Facturación digital aún no implementada. Contactar al consultorio.');
}

module.exports = { emitirFactura };
