require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const connectDB  = require('./config/db');

const app = express();

// ── Connect Database ──────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/students',     require('./routes/students'));
app.use('/api/rooms',        require('./routes/rooms'));
app.use('/api/complaints',   require('./routes/complaints'));
app.use('/api/outpasses',    require('./routes/outpass'));
app.use('/api/attendance',   require('./routes/attendance'));
app.use('/api/notices',      require('./routes/notices'));
app.use('/api/mess',         require('./routes/mess'));
app.use('/api/visitors',     require('./routes/visitors'));
app.use('/api/roomchanges',  require('./routes/roomchanges'));
app.use('/api/fees',         require('./routes/fees'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/managers',     require('./routes/managers'));

// ── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'HMS Backend running' }));

// ── 404 Handler ───────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

// ── Start Server ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
