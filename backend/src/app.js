// ¡IMPORTANTE! Esta debe ser la línea 1 de todo el archivo
require('./instrument.js');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Traemos a Sentry para que trabaje junto a Express
const Sentry = require('@sentry/node');

const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const clientRoutes   = require('./routes/clients');
const saleRoutes     = require('./routes/sales');
const reportRoutes   = require('./routes/reports');
const userRoutes     = require('./routes/users');
const evalRoutes     = require('./routes/eval');

const app = express();

// ========================================================================
// 0. CONFIANZA EN EL PROXY - ALTA DISPONIBILIDAD
// ========================================================================
app.set('trust proxy', 1);

// ========================================================================
// 1. EL GUARDIA DE LA PUERTA (CORS Restringido) - SEGURIDAD
// ========================================================================
app.use(cors({
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ARCHIVOS ESTÁTICOS ─────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ========================================================================
// 2. EL CHEQUEO MÉDICO (Endpoint /health) - ALTA DISPONIBILIDAD
// ========================================================================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    mensaje: 'Servidor operativo y listo',
    timestamp: new Date()
  });
});

// ─── RUTAS ──────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/clients',  clientRoutes);
app.use('/api/sales',    saleRoutes);
app.use('/api/reports',  reportRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/eval',     evalRoutes);

// ========================================================================
// 3. CAPTURADOR DE ERRORES (SENTRY)
// ========================================================================
// Esto atrapa cualquier problema antes de que el servidor colapse
Sentry.setupExpressErrorHandler(app);

// ─── MANEJO DE ERRORES GLOBAL ───────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;
