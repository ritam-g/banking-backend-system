const express = require('express');
const { accountFunction } = require('../controller/account.controller');


const accountRoute = express.Router()

accountRoute.get('/',accountFunction)


module.exports=accountRoute