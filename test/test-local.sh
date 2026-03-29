#!/bin/bash
# =============================================
# TEST LOCAL DEL BOT — corre con MOCK_WHATSAPP=true
#
# Como usar:
#   1. En una terminal: MOCK_WHATSAPP=true npm start
#   2. En otra terminal: bash test/test-local.sh
# =============================================

PORT="${PORT:-3000}"
BASE_URL="http://localhost:$PORT/webhook"

VERDE="\033[0;32m"
AMARILLO="\033[1;33m"
ROJO="\033[0;31m"
RESET="\033[0m"

probar_mensaje() {
  local texto="$1"
  local descripcion="$2"

  echo ""
  echo -e "${AMARILLO}━━━ TEST: $descripcion ━━━${RESET}"
  echo -e "📤 Enviando: \"$texto\""

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{\"entry\":[{\"changes\":[{\"value\":{\"contacts\":[{\"wa_id\":\"5492284000001\"}],\"messages\":[{\"from\":\"5492284000001\",\"type\":\"text\",\"text\":{\"body\":\"$texto\"}}]}}]}]}")

  if [ "$STATUS" = "200" ]; then
    echo -e "${VERDE}✅ HTTP $STATUS — OK${RESET}"
  else
    echo -e "${ROJO}❌ HTTP $STATUS — Error inesperado${RESET}"
  fi
}

probar_no_texto() {
  echo ""
  echo -e "${AMARILLO}━━━ TEST: Mensaje que NO es texto (imagen) ━━━${RESET}"
  echo -e "📤 Enviando mensaje de tipo 'image'"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d '{"entry":[{"changes":[{"value":{"contacts":[{"wa_id":"5492284000001"}],"messages":[{"from":"5492284000001","type":"image","image":{"id":"123"}}]}}]}]}')

  if [ "$STATUS" = "200" ]; then
    echo -e "${VERDE}✅ HTTP $STATUS — OK (debe responder con el menu)${RESET}"
  else
    echo -e "${ROJO}❌ HTTP $STATUS — Error inesperado${RESET}"
  fi
}

probar_verificacion() {
  echo ""
  echo -e "${AMARILLO}━━━ TEST: Verificacion GET del webhook (Meta) ━━━${RESET}"

  VERIFY_TOKEN="${WHATSAPP_VERIFY_TOKEN:-test-token}"

  RESPONSE=$(curl -s -w "\n%{http_code}" \
    "$BASE_URL?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=CHALLENGE_123")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -1)

  if [ "$HTTP_CODE" = "200" ] && [ "$BODY" = "CHALLENGE_123" ]; then
    echo -e "${VERDE}✅ HTTP $HTTP_CODE — Webhook verificado correctamente${RESET}"
  elif [ "$HTTP_CODE" = "403" ]; then
    echo -e "${ROJO}❌ HTTP $HTTP_CODE — Token no coincide. Revisa WHATSAPP_VERIFY_TOKEN en .env${RESET}"
  else
    echo -e "${ROJO}❌ HTTP $HTTP_CODE — Respuesta inesperada: $BODY${RESET}"
  fi
}

# ─── INICIO DE LOS TESTS ───────────────────────────────────────────

echo ""
echo -e "${VERDE}╔════════════════════════════════════════╗"
echo -e "║   TEST SUITE — Bot Torrado & Berney    ║"
echo -e "╚════════════════════════════════════════╝${RESET}"
echo "Servidor: $BASE_URL"
echo "Asegurate de tener el servidor corriendo con MOCK_WHATSAPP=true"
echo "Mira la terminal del servidor para ver las respuestas del bot"

echo ""
echo "Verificando que el servidor este activo..."
if ! curl -s "http://localhost:$PORT/" > /dev/null; then
  echo -e "${ROJO}❌ No se puede conectar al servidor en localhost:$PORT${RESET}"
  echo "   Inicia el servidor con: MOCK_WHATSAPP=true npm start"
  exit 1
fi
echo -e "${VERDE}✅ Servidor activo${RESET}"

# ── Menu principal ──
probar_mensaje "hola"           "Texto libre → debe mostrar menu"
probar_mensaje "1"              "Opcion 1 — Horarios de atencion"
probar_mensaje "2"              "Opcion 2 — Sacar un turno"
probar_mensaje "3"              "Opcion 3 — Cancelar o reprogramar turno"
probar_mensaje "5"              "Opcion 5 — Factura digital"
probar_mensaje "6"              "Opcion 6 — Otra consulta"

# ── Submenu recetas (4) ──
probar_mensaje "4"              "Opcion 4 — Recetas digitales (submenu)"
probar_mensaje "41"             "Opcion 41 — Ya registrado en RCTA"
probar_mensaje "42"             "Opcion 42 — No registrado en RCTA"
probar_mensaje "43"             "Opcion 43 — Problemas con registro"

# ── Secretaria y escape ──
probar_mensaje "0"              "Opcion 0 — Hablar con secretaria (detallado)"
probar_mensaje "menu"           "Escribir 'menu' → volver al bot desde secretaria"
probar_mensaje "00"             "Opcion 00 — Hablar con secretaria (simple)"
probar_mensaje "volver"         "Escribir 'volver' → volver al bot desde secretaria"

# ── Casos borde ──
probar_mensaje "  2  "          "Numero con espacios → debe funcionar igual"
probar_mensaje "HOLA"           "Texto en mayusculas → debe mostrar menu"
probar_no_texto
probar_verificacion

echo ""
echo -e "${VERDE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${VERDE}Tests completados. Revisa la terminal del servidor${RESET}"
echo -e "${VERDE}para ver el contenido de cada respuesta.${RESET}"
echo ""
