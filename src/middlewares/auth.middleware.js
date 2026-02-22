const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const ledgerModel = require('../models/ledger.model');

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

        if (!token) return res.status(401).json({ message: 'unauthorized user' })
        let decode
        try {
            // ({ id: user._id ,email:user.email,name:user.name }

            decode = jwt.verify(token, process.env.JWT_SEC)
        } catch (err) {
            return res.status(401).json({
                message: "unauthorized user"
            })
        }
        const user = await userModel.findById(decode.id)

        if (!user) return res.status(401).json({ message: 'unauthorized user' })

        req.user = decode
        next()
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "internal server error" })
    }
}
async function systemUserMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

        if (!token) return res.status(401).json({ message: 'unauthorized user' })
        let decode
        try {
            // ({ id: user._id ,email:user.email,name:user.name }
            decode = jwt.verify(token, process.env.JWT_SEC)
        } catch (err) {
            return res.status(401).json({
                message: "unauthorized user"
            })
        }
        const user = await userModel.findById(decode.id).select("+systemUser")

        if (!user.systemUser) return res.status(401).json({ message: 'unauthorized user' })
            
        req.user = user
        next()
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "internal server error" })
    }
}
module.exports = { authMiddleware, systemUserMiddleware }