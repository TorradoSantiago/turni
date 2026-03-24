# Seguridad en Turni

Este archivo documenta las medidas de seguridad del bot y qué hacer si algo sale mal.

## Resumen rápido

| Riesgo | Estado | Solución implementada |
|---|---|---|
| Token de acceso expuesto | Protegido | Vive en `.env`, fuera del código |
| Mensajes falsos al webhook | Protegido | Verificación con `VERIFY_TOKEN` |
| Datos de pacientes robados | No aplica | El bot no guarda ningún dato |
| Inyección de código | No aplica | Las respuestas son textos fijos |
| Comunicación sin cifrar | Protegido | HTTPS obligatorio (ngrok / Railway) |

---

## Si el token de Meta se filtra

Si por error el `WHATSAPP_TOKEN` quedó expuesto (subido a GitHub, compartido, etc.):

1. Ir a [Meta for Developers](https://developers.facebook.com/apps/)
2. Abrir la app → WhatsApp → Configuración
3. Generar un nuevo token de acceso
4. Actualizar el `.env` (local) y las variables de entorno en Railway

El token viejo queda invalidado automáticamente.

---

## Qué puede y qué no puede hacer alguien que escribe al bot

Un paciente (o cualquier persona) que escriba al número solo puede:
- Ver el menú de opciones
- Ver horarios, links de turnos, dirección y teléfono
- Dejar su nombre para cancelar un turno o hacer una consulta

No puede:
- Acceder a datos de otros pacientes (no hay base de datos)
- Modificar ninguna configuración
- Ejecutar código (las respuestas son textos estáticos)
- Hacer nada más allá de recibir información pública del consultorio

---

## Reporte de vulnerabilidades

Si encontrás un problema de seguridad, contactar a Santiago Torrado directamente.
No abrir un issue público en GitHub para problemas de seguridad.
