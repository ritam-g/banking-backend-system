const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS — allow frontend dev server
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

/**
 * API Routes
 */
const authRoutes = require('./routes/auth.routes');
const accountRoute = require('./routes/account.routes');
const transactionRoute = require('./routes/transaction.routes');

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoute);
app.use('/api/transaction', transactionRoute);

/**
 * Production — serve frontend static files
 */
const frontendPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(frontendPath));

// API routes are handled above.
// For any other GET request, serve the index.html (the Wildcard route)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;