const express = require('express');
const { authMiddleware, systemUserMiddleware } = require('../middlewares/auth.middleware');
const { createTransaction, createInitialFundTransaction } = require('../controller/transaction.controller');

const transactionRoute=express.Router()


transactionRoute.post('/',authMiddleware,createTransaction)

/**
 * /api/transaction
 * create initial tarnsaction for the routes
 */
transactionRoute.post("/system/initial-funds",systemUserMiddleware,createInitialFundTransaction)

module.exports=transactionRoute

