const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createAccountController } = require('../controller/account.controller');


const accountRoute = express.Router()

/**
 * post  /api/accounts
 * create new account for user
 * protected route
 */
accountRoute.post('/create',authMiddleware,createAccountController)


module.exports=accountRoute