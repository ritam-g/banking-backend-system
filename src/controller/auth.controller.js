const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
const { sendRegiestrationEmail } = require("../services/email.service");


//* INFO //! user wil be regiester her   
async function userRegiesterController(req, res) {
    const { name, email, password } = req.body
    // console.log('api hit :::--->   userRegiesterController');


    const userExiest = await userModel.findOne({ email })

    if (userExiest) return res.status(422).json({ message: "user alredy exiest with this email", status: "faild" })


    const user = await userModel.create({ email, name, password })


    const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, { expiresIn: '3d' })

    res.cookie('token', token)

    //! async code it will take to send mail to our coustomer 
    sendRegiestrationEmail(email, name)
    return res.status(200).json(
        {
            message: 'regiester is success',
            user: {
                _id: user.id, email: user.email
            },
            token
        },

    )


}

/**
 * user login controller
 * /api/auth/login
 * 
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

        let token;
        try {
            token = jwt.sign(
                { id: user._id },
                process.env.JWT_SEC,
                { expiresIn: '3d' }
            );
        } catch (err) {
            return res.status(500).json({ message: 'JWT issue' });
        }

        res.cookie('token', token);

        return res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                email: user.email
            },
            token
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: 'Something went wrong'
        });
    }
}


module.exports = { userRegiesterController, userLoginController }