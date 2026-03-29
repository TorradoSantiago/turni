#!/bin/bash
# =============================================
# TEST LOCAL DEL BOT - corre con MOCK_WHATSAPP=true
#
# Como usar:
#   1. En una terminal: MOCK_WHATSAPP=true npm start
#   2. En otra terminal: bash test/test-local.sh
# =============================================

BASE_URL="http://localhost:3000/webhook"

# Colores para que sea facil leer en la terminal
VERDE="\033[0;32m"
AMARILLO="\033[1;33m"
ROJO="\033[0;31m"
RESET="\033[0m"

# Funcion helper: envia un mensaje al bot y muestra el resultado
# $1 = texto del mensaje, $2 = descripcion del test
probar_mensaje() {
  local texto="$1"
  local descripcion="$2"

  echo ""
  echo -e "${AMARILLO}--- TEST: $descripcion ---${RESET}"
  echo -e "Enviando: \"$texto\""

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{\"entry\":[{\"changes\":[{\"value\":{\"messages\":[{\"from\":\"5492284000001\",\"type\":\"text\",\"text\":{\"body\":\"$texto\"}}]}}]}]}")

  if [ "$STATUS" = "200" ]; then
    echo -e "${VERDE}OK HTTP $STATUS${RESET}"
  else
    echo -e "${ROJO}Error HTTP $STATUS${RESET}"
  fi
}

# Test especial para mensajes que no son texto
probar_no_texto() {
  echo ""
  echo -e "${AMARILLO}--- TEST: Mensaje que no es texto (imagen) ---${RESET}"
  echo -e "Enviando mensaje de tipo 'image'"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"5492284000001","type":"image","image":{"id":"123"}}]}}]}]}')

  if [ "$STATUS" = "200" ]; then
    echo -e "${VERDE}OK HTTP $STATUS${RESET}"
  else
    echo -e "${ROJO}Error HTTP $STATUS${RESET}"
  fi
}

# Test de verificacion GET (lo que hace Meta al registrar el webhook)
probar_verificacion() {
  echo ""
  echo -e "${AMARILLO}--- TEST: Verificacion GET del webhook ---${RESET}"

  VERIFY_TOKEN="${WHATSAPP_VERIFY_TOKEN:-test-token}"

  RESPONSE=$(curl -s -w "\n%{http_code}" \
    "$BASE_URL?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=CHALLENGE_123")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -1)

  if [ "$HTTP_CODE" = "200" ] && [ "$BODY" = "CHALLENGE_123" ]; then
    echo -e "${VERDE}OK HTTP $HTTP_CODE - Webhook verificado correctamente${RESET}"
  elif [ "$HTTP_CODE" = "403" ]; then
    echo -e "${ROJO}Error HTTP $HTTP_CODE - Revisar WHATSAPP_VERIFY_TOKEN en .env${RESET}"
  else
    echo -e "${ROJO}Respuesta inesperada HTTP $HTTP_CODE: $BODY${RESET}"
  fi
}

echo ""
echo -e "${VERDE}========================================${RESET}"
echo -e "${VERDE} Test suite - Bot Torrado & Berney ${RESET}"
echo -e "${VERDE}========================================${RESET}"
echo "Asegurate de tener el servidor corriendo con MOCK_WHATSAPP=true"
echo "Mira la terminal del servidor para ver las respuestas del bot"

echo ""
echo "Verificando que el servidor este activo..."
if ! curl -s "http://localhost:3000/" > /dev/null; then
  echo -e "${ROJO}No se puede conectar al servidor en localhost:3000${RESET}"
  echo "Inicia el servidor con: MOCK_WHATSAPP=true npm start"
  exit 1
fi
echo -e "${VERDE}Servidor activo${RESET}"

# Tests del menu y los submenus
probar_mensaje "hola"           "Texto aleatorio -> debe mostrar menu"
probar_mensaje "1"              "Opcion 1 -> Horarios"
probar_mensaje "2"              "Opcion 2 -> Sacar turno"
probar_mensaje "3"              "Opcion 3 -> Cancelar turno"
probar_mensaje "4"              "Opcion 4 -> Submenu recetas"
probar_mensaje "41"             "Subopcion 41 -> Paciente ya registrado"
probar_mensaje "42"             "Subopcion 42 -> Alta en RCTA y pedido de receta"
probar_mensaje "43"             "Subopcion 43 -> Problemas con el registro"
probar_mensaje "volver"         "Salir del submenu y volver al menu principal"
probar_mensaje "5"              "Opcion 5 -> Factura digital"
probar_mensaje "6"              "Opcion 6 -> Otra consulta"
probar_mensaje "0"              "Opcion 0 -> Hablar con la secretaria"
probar_mensaje "menu"           "Salir del modo secretaria y volver al menu"
probar_mensaje "  2  "          "Numero con espacios -> debe funcionar igual"
probar_mensaje "HOLA"           "Texto en mayusculas -> debe mostrar menu"
probar_no_texto
probar_verificacion

echo ""
echo -e "${VERDE}========================================${RESET}"
echo -e "${VERDE}Tests completados. Revisa la terminal del servidor.${RESET}"
echo ""
