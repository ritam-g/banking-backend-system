const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createAccountController, getAllAccount, getAllAccountsWithBalance, getAccountBalanceController } = require('../controller/account.controller');

const accountRoute = express.Router();

/** POST /api/accounts/create — create new account */
accountRoute.post('/create', authMiddleware, createAccountController);

/** GET /api/accounts/with-balance — all accounts with balance (MUST be before /:searchid) */
accountRoute.get('/with-balance', authMiddleware, getAllAccountsWithBalance);

/** GET /api/accounts — list all accounts */
accountRoute.get('/', authMiddleware, getAllAccount);

/** GET /api/accounts/:searchid — single account balance */
accountRoute.get('/:searchid', authMiddleware, getAccountBalanceController);

module.exports = accountRoute;