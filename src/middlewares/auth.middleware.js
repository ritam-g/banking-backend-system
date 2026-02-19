const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    try {
        if (!token) return res.status(401).json({ message: 'unauthorized user' })
        let decode
        try {
            decode = jwt.verify(token, process.env.JWT_SEC)
        } catch (err) {
            return res.status(401).json({
                message: "unauthorized user"
            })
        }
        const user = await userModel.findById(decode.id)

        if (!user) return res.status(401).json({ message: 'unauthorized user' })

        req.user = decode.id
        next()
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "internal server error" })
    }
}
module.exports = { authMiddleware }