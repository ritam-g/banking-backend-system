const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
const { sendRegistrationEmail, sendLoginEmail } = require("../services/email.service");

/**
 * POST /api/auth/register
 */
async function userRegiesterController(req, res) {
    try {
        const { name, email, password } = req.body;

        const userExist = await userModel.findOne({ email });
        if (userExist) return res.status(422).json({ message: "User already exists with this email", status: "failed" });

        const user = await userModel.create({ email, name, password });

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SEC,
            { expiresIn: '3d' }
        );

        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 3 * 24 * 60 * 60 * 1000 });

        // Async email — non-blocking
        sendRegistrationEmail({ email, name });

        return res.status(200).json({
            message: 'Registration successful',
            user: { _id: user.id, email: user.email, name: user.name },
            token
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
}

/**
 * POST /api/auth/login
 */
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: 'Email or password is invalid' });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Email or password is invalid' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SEC,
            { expiresIn: '3d' }
        );

        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 3 * 24 * 60 * 60 * 1000 });

        // Send login notification email (async — non-blocking)
        sendLoginEmail({ email, name: user.name || email });

        return res.status(200).json({
            message: 'Login successful',
            user: { _id: user._id, email: user.email, name: user.name },
            token
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

/**
 * GET /api/auth/me — return the current user info
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({
            user: { _id: user._id, email: user.email, name: user.name, createdAt: user.createdAt }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * POST /api/auth/logout
 */
async function logoutController(req, res) {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = { userRegiesterController, userLoginController, getMeController, logoutController };