const express = require('express');
const { userRegiesterController } = require('../controller/auth.controller');

const authRoute = express.Router()

/** api is         //! /api/auth/register       */
authRoute.post('/register', userRegiesterController)


module.exports = authRoute