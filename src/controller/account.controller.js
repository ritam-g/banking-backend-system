const accountModel = require("../models/account.model")

async function createAccountController(req,res) {
    const userId=req.user.id

  const account= await accountModel.create({
        user:userId
    })
    return res.status(201).json({
        message:'new account is created ',account
    })
}
module.exports={createAccountController}