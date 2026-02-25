const accountModel = require("../models/account.model");

/**
 * POST /api/accounts/create
 */
async function createAccountController(req, res) {
    try {
        const userId = req.user.id;
        const account = await accountModel.create({ user: userId });
        return res.status(201).json({
            message: 'New account created successfully',
            account
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}

/**
 * GET /api/accounts
 */
async function getAllAccount(req, res) {
    try {
        const allAccount = await accountModel.find({ user: req.user.id });
        return res.status(200).json({
            message: "All accounts fetched",
            accounts: allAccount
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * GET /api/accounts/with-balance
 * Returns all accounts with their computed balances
 */
async function getAllAccountsWithBalance(req, res) {
    try {
        const accounts = await accountModel.find({ user: req.user.id });
        const accountsWithBalance = await Promise.all(
            accounts.map(async (account) => {
                const balance = await account.getBalance();
                return { ...account.toObject(), balance };
            })
        );
        return res.status(200).json({
            message: 'Accounts with balance fetched',
            accounts: accountsWithBalance
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * GET /api/accounts/:searchid
 */
async function getAccountBalanceController(req, res) {
    try {
        const searchId = req.params.searchid;
        const account = await accountModel.findOne({
            _id: searchId, user: req.user.id
        });
        if (!account) return res.status(404).json({ message: 'Account not found' });
        const balance = await account.getBalance();
        return res.status(200).json({ balance });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

module.exports = { createAccountController, getAllAccount, getAllAccountsWithBalance, getAccountBalanceController };