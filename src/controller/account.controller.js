const accountModel = require("../models/account.model")

async function createAccountController(req, res) {
    const userId = req.user.id

    const account = await accountModel.create({
        user: userId
    })
    return res.status(201).json({
        message: 'new account is created ', account
    })
}
async function getAllAccount(req, res) {
    const allAccount = await accountModel.find({ user: req.user.id })
    return res.status(200).json({
        message: "all account fetch",
        accounts: allAccount
    })

}
async function getAccountBalanceController(req, res) {
    try {
        const searchId = req.params.searchid
        //! check valid user with valid id or not  
        const account = await accountModel.findOne({
            _id: searchId, user: req.user.id
        })
        if (!account) return res.status(401).json({ message: account})
        const balance = await account.getBalance()
        return res.status(200).json({
            balance: balance
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err.message })
    }

}
module.exports = { createAccountController, getAllAccount, getAccountBalanceController }