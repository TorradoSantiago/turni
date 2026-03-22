const axios = require('axios');


async function sendTextMessage(to, text) {
  if (process.env.MOCK_WHATSAPP === 'true') {
    console.log(`[MOCK WHATSAPP] to=${to} text=${text}`);
    return { mock: true, to, text };
  }

  const TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment');
  }

  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  const res = await axios.post(url, payload, { headers });
  return res.data;
}

module.exports = { sendTextMessage };
