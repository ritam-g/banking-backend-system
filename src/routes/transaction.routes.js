const express = require('express');
const { authMiddleware, systemUserMiddleware } = require('../middlewares/auth.middleware');
const { createTransaction, createInitialFundTransaction, getTransactionHistory } = require('../controller/transaction.controller');

const transactionRoute = express.Router();

/** GET /api/transaction/history — user's transaction history */
transactionRoute.get('/history', authMiddleware, getTransactionHistory);

/** POST /api/transaction — create a new transfer */
transactionRoute.post('/', authMiddleware, createTransaction);

/** POST /api/transaction/system/initial-funds — system seeds funds */
transactionRoute.post('/system/initial-funds', systemUserMiddleware, createInitialFundTransaction);

module.exports = transactionRoute;
