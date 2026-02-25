const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// CORS — allow frontend dev server
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

/**
 * Importing routes
 */
const authRoutes = require('./routes/auth.routes');
const accountRoute = require('./routes/account.routes');
const transactionRoute = require('./routes/transaction.routes');

/**
 * API routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoute);
app.use('/api/transaction', transactionRoute);

// Serve frontend in production
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    }
});

module.exports = app;