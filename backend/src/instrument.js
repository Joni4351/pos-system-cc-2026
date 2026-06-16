// ~/pos-system-cc-2026/backend/instrument.js
require('dotenv').config(); // Añadimos esto para que lea el .env de inmediato
const Sentry = require("@sentry/node");

Sentry.init({
  // En lugar del texto largo, ahora lee de forma segura tu archivo .env
  dsn: process.env.SENTRY_DSN, 
  enableLogs: true,
  tracesSampleRate: 1.0,
});
