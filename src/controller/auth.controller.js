const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken')

//* INFO //! user wil be regiester her   
async function userRegiesterController(req, res) {
    const { name, email, password } = req.body
    console.log('userRegiesterController:---> api hit');
    

    const userExiest = await userModel.findOne({ email })

    if (userExiest) return res.status(422).json({ message: "user alredy exiest with this email", status: "faild" })


    const user = await userModel.create({ email, name, password })


    const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, { expiresIn: '3d' })

    res.cookie('token', token)


    return res.status(201).json(
        {
            message: 'regiester is success',
            user: {
                _id: user.id, email: user.email
            },
            token
        },

    )
}

module.exports = { userRegiesterController }