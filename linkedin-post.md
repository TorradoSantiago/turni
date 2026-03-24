# Post de LinkedIn — Turni Bot

---

Construí un bot de WhatsApp para el consultorio de mi papá. Y fue la mejor forma de aprender que conozco.

Mi viejo es médico oftalmólogo en Olavarría. La secretaria recibía decenas de mensajes por día con las mismas preguntas: horarios, cómo sacar turno, cómo cancelar, cómo pedir una receta digital.

En lugar de quejarnos, lo automatizamos.

**Lo que hace el bot hoy:**
→ Responde horarios de los dos médicos (Olavarría y Bolívar)
→ Manda los links de DocTurno para sacar turno online
→ Guía a los pacientes paso a paso por el sistema de recetas digitales (RCTA)
→ Deriva a la secretaria cuando el paciente lo pide — y pausa el bot hasta que el paciente quiera volver

**Lo que aprendí construyéndolo:**
El problema real no era técnico. Era entender qué necesitaba una persona de 70 años para poder pedir su gota sin llamar por teléfono. Eso requiere empatía, no solo código.

**Stack:**
— Node.js + Express para el servidor y el webhook
— WhatsApp Cloud API (Meta for Developers) para enviar y recibir mensajes
— Railway para el hosteo con deploy automático desde GitHub
— Sin base de datos, sin IA, sin frameworks pesados. Todo en memoria, simple y directo.

El proyecto arrancó con 3 archivos. Hoy sigue siendo 3 archivos. La complejidad no siempre es una virtud.

Lo que sigue: token permanente de Meta, migración al número real del consultorio, y eventualmente integración con AFIP para factura electrónica automática.

Si tenés un problema real cerca tuyo, probablemente sea el mejor proyecto que podés hacer.

github.com/TorradoSantiago/turni

#javascript #nodejs #whatsapp #buildinpublic #webdev #emprendimiento #argentina
