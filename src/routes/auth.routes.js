const express = require('express');
const { userRegiesterController, userLoginController } = require('../controller/auth.controller');
const userModel = require('../models/user.model');

const authRoute = express.Router()

/** api is         //! /api/auth/register       */
authRoute.post('/register', userRegiesterController)

/** 
 * methode post
 * acept user email pass
 * /api/auth/login
*/
authRoute.post('/login', userLoginController)

module.exports = authRoute