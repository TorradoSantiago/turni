# Minimal WhatsApp Cloud API bot (Express)

This project demonstrates a minimal Node.js app that verifies the WhatsApp webhook, logs inbound messages, and sends a simple text reply via the WhatsApp Cloud API.

Setup

1. Copy `.env.example` to `.env` and fill in your credentials.

2. Install dependencies:

```bash
npm install express axios dotenv
```

3. Start the server:

```bash
node src/server.js
```

Webhook endpoints

- `GET /webhook` — verification endpoint used by Facebook/Meta.
- `POST /webhook` — receives messages, logs them, and replies with a simple text message.
