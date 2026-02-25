const express = require('express');
const { userRegiesterController, userLoginController, getMeController, logoutController } = require('../controller/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const authRoute = express.Router();

/** POST /api/auth/register */
authRoute.post('/register', userRegiesterController);

/** POST /api/auth/login */
authRoute.post('/login', userLoginController);

/** GET /api/auth/me — get current user */
authRoute.get('/me', authMiddleware, getMeController);

/** POST /api/auth/logout */
authRoute.post('/logout', authMiddleware, logoutController);

module.exports = authRoute;