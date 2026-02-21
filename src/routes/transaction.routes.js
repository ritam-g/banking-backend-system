const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createTransaction } = require('../controller/transaction.controller');

const transactionRoute=express.Router()


transactionRoute.post('/',authMiddleware,createTransaction)


module.exports=transactionRoute

