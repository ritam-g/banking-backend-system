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
 * In production: `npm run build` creates client/dist
 * The backend serves those files + SPA fallback
 */
const frontendPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(frontendPath));

// SPA fallback for client-side routing
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        const indexPath = path.join(frontendPath, 'index.html');
        res.sendFile(indexPath, (err) => {
            if (err) next();
        });
    } else {
        next();
    }
});

module.exports = app;