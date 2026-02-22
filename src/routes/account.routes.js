const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createAccountController, getAllAccount, getAccountBalanceController } = require('../controller/account.controller');


const accountRoute = express.Router()

/**
 * post  /api/accounts
 * create new account for user
 * protected route
 */
accountRoute.post('/create',authMiddleware,createAccountController)
/**
 * get  /api/accounts
 * get all account
 * protected route
 */
accountRoute.get('/',authMiddleware,getAllAccount)
/**
 * get  /api/accounts
 * get account balnce
 * protected route
 */
accountRoute.get('/:searchid',authMiddleware,getAccountBalanceController)

module.exports=accountRoute