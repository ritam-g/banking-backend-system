const express = require('express');
const cookieParser=require('cookie-parser');


const app=express()


app.use(express.json())
app.use(cookieParser())
/**
 * importing routes
 */
const authRoutes = require('./routes/auth.routes');
const accountRoute = require('./routes/account.routes');
const transactionRoute = require('./routes/transaction.routes');
/**
 * user routes
 */
app.use('/api/auth',authRoutes)
app.use('/api/accounts',accountRoute)
app.use('/api/transaction',transactionRoute)

module.exports=app