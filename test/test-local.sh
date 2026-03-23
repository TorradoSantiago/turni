#!/bin/bash
# =============================================
# TEST LOCAL DEL BOT — corre con MOCK_WHATSAPP=true
#
# Cómo usar:
#   1. En una terminal: MOCK_WHATSAPP=true npm start
#   2. En otra terminal: bash test/test-local.sh
# =============================================

BASE_URL="http://localhost:3000/webhook"

# Colores para que sea fácil leer en la terminal
VERDE="\033[0;32m"
AMARILLO="\033[1;33m"
ROJO="\033[0;31m"
RESET="\033[0m"

# Función helper: envía un mensaje al bot y muestra el resultado
# $1 = texto del mensaje, $2 = descripción del test
probar_mensaje() {
  local texto="$1"
  local descripcion="$2"

  echo ""
  echo -e "${AMARILLO}━━━ TEST: $descripcion ━━━${RESET}"
  echo -e "📤 Enviando: \"$texto\""

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{\"entry\":[{\"changes\":[{\"value\":{\"messages\":[{\"from\":\"5492284000001\",\"type\":\"text\",\"text\":{\"body\":\"$texto\"}}]}}]}]}")

  if [ "$STATUS" = "200" ]; then
    echo -e "${VERDE}✅ HTTP $STATUS — OK${RESET}"
  else
    echo -e "${ROJO}❌ HTTP $STATUS — Error inesperado${RESET}"
  fi
}

# Test especial para mensajes que NO son texto (foto, audio, etc.)
probar_no_texto() {
  echo ""
  echo -e "${AMARILLO}━━━ TEST: Mensaje que NO es texto (imagen) ━━━${RESET}"
  echo -e "📤 Enviando mensaje de tipo 'image'"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"5492284000001","type":"image","image":{"id":"123"}}]}}]}]}')

  if [ "$STATUS" = "200" ]; then
    echo -e "${VERDE}✅ HTTP $STATUS — OK (debe responder con el menú)${RESET}"
  else
    echo -e "${ROJO}❌ HTTP $STATUS — Error inesperado${RESET}"
  fi
}

# Test de verificación GET (lo que hace Meta al registrar el webhook)
probar_verificacion() {
  echo ""
  echo -e "${AMARILLO}━━━ TEST: Verificación GET del webhook (Meta) ━━━${RESET}"

  # Leer el token del .env si existe, sino usar uno de prueba
  VERIFY_TOKEN="${WHATSAPP_VERIFY_TOKEN:-test-token}"

  RESPONSE=$(curl -s -w "\n%{http_code}" \
    "$BASE_URL?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=CHALLENGE_123")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -1)

  if [ "$HTTP_CODE" = "200" ] && [ "$BODY" = "CHALLENGE_123" ]; then
    echo -e "${VERDE}✅ HTTP $HTTP_CODE — Webhook verificado correctamente${RESET}"
  elif [ "$HTTP_CODE" = "403" ]; then
    echo -e "${ROJO}❌ HTTP $HTTP_CODE — Token no coincide. Revisá WHATSAPP_VERIFY_TOKEN en .env${RESET}"
  else
    echo -e "${ROJO}❌ HTTP $HTTP_CODE — Respuesta inesperada: $BODY${RESET}"
  fi
}

# ─── INICIO DE LOS TESTS ───────────────────────────────────────────

echo ""
echo -e "${VERDE}╔════════════════════════════════════════╗"
echo -e "║   TEST SUITE — Bot Torrado & Berney    ║"
echo -e "╚════════════════════════════════════════╝${RESET}"
echo "Asegurate de tener el servidor corriendo con MOCK_WHATSAPP=true"
echo "Mirá la terminal del servidor para ver las respuestas del bot"

# Verificar que el servidor esté corriendo antes de los tests
echo ""
echo "Verificando que el servidor esté activo..."
if ! curl -s "http://localhost:3000/" > /dev/null; then
  echo -e "${ROJO}❌ No se puede conectar al servidor en localhost:3000${RESET}"
  echo "   Iniciá el servidor con: MOCK_WHATSAPP=true npm start"
  exit 1
fi
echo -e "${VERDE}✅ Servidor activo${RESET}"

# ── Tests del menú ──
probar_mensaje "hola"           "Texto aleatorio → debe mostrar menú"
probar_mensaje "1"              "Opción 1 — Horarios"
probar_mensaje "2"              "Opción 2 — Sacar turno (con sub-info Paula)"
probar_mensaje "3"              "Opción 3 — Cancelar turno"
probar_mensaje "4"              "Opción 4 — Factura digital"
probar_mensaje "5"              "Opción 5 — Contacto"
probar_mensaje "6"              "Número fuera de rango → debe mostrar menú"
probar_mensaje "  2  "          "Número con espacios → debe funcionar igual"
probar_mensaje "HOLA"           "Texto en mayúsculas → debe mostrar menú"
probar_no_texto
probar_verificacion

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}Tests completados. Revisá la terminal del servidor${RESET}"
echo -e "${VERDE}para ver el contenido de cada respuesta.${RESET}"
echo ""
