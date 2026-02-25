const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");
const { sendTransactionEmail } = require("../services/email.service");
const mongoose = require('mongoose');

/**
 * POST /api/transaction
 * 10-STEP TRANSFER FLOW with MongoDB transactions
 */
async function createTransaction(req, res) {
    const session = await mongoose.startSession();
    try {
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: 'All fields are required: fromAccount, toAccount, amount, idempotencyKey'
            });
        }

        if (fromAccount === toAccount) {
            return res.status(400).json({ message: 'fromAccount and toAccount cannot be the same' });
        }

        const fromAccountDetails = await accountModel.findById(fromAccount);
        const toAccountDetails = await accountModel.findById(toAccount);

        if (!fromAccountDetails || !toAccountDetails) {
            return res.status(404).json({ message: 'fromAccount or toAccount not found' });
        }

        // Check idempotency
        const existingTransaction = await transactionModel.findOne({ idempotencyKey });
        if (existingTransaction) {
            const { status } = existingTransaction;
            const statusResponseMap = {
                COMPLETED: { code: 200, message: "Transaction already completed successfully." },
                FAILED: { code: 400, message: "Transaction previously failed." },
                CANCELED: { code: 400, message: "Transaction was canceled." },
                REFUNDED: { code: 200, message: "Transaction has been refunded." },
                PENDING: { code: 202, message: "Transaction is still processing." },
                REVERSED: { code: 200, message: "Transaction was reversed." }
            };
            const response = statusResponseMap[status];
            if (response) {
                return res.status(response.code).json({ message: response.message, status });
            }
        }

        // Check account status
        if (fromAccountDetails.status !== "ACTIVE" || toAccountDetails.status !== "ACTIVE") {
            return res.status(400).json({ message: 'One or both accounts are not active' });
        }

        // Check balance
        const balance = await fromAccountDetails.getBalance();
        if (balance < amount) {
            return res.status(400).json({
                message: `Insufficient balance. Current balance: ₹${balance}`
            });
        }

        // MongoDB session for atomic transaction
        session.startTransaction();

        const transaction = await transactionModel.create([{
            fromAccount, toAccount, amount, status: "PENDING", idempotencyKey
        }], { session });

        await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction[0]._id,
            type: "DEBIT"
        }], { session });

        await ledgerModel.create([{
            account: toAccount,
            type: "CREDIT",
            amount: amount,
            transaction: transaction[0]._id
        }], { session });

        transaction[0].status = "COMPLETED";
        await transaction[0].save({ session });

        await session.commitTransaction();
        session.endSession();

        // Send email notification (async — non-blocking)
        sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

        return res.status(201).json({
            message: "Transaction successfully completed",
            transaction: transaction[0]
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * POST /api/transaction/system/initial-funds
 * System user seeds funds into a user's account
 */
async function createInitialFundTransaction(req, res) {
    const session = await mongoose.startSession();
    try {
        const { toAccount, amount, idempotencyKey } = req.body;
        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: 'All fields are required: toAccount, amount, idempotencyKey'
            });
        }

        const toAccountDetails = await accountModel.findOne({ user: toAccount });
        if (!toAccountDetails) {
            return res.status(404).json({ message: 'toAccount not found' });
        }

        const fromUserAccount = await accountModel.findOne({ user: req.user._id });
        if (!fromUserAccount) {
            return res.status(400).json({ message: "System user account not found" });
        }

        session.startTransaction();

        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount: toAccountDetails._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        });

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session });

        await ledgerModel.create([{
            account: toAccountDetails._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session });

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

/**
 * GET /api/transaction/history
 * Returns all transactions for the logged-in user's accounts
 */
async function getTransactionHistory(req, res) {
    try {
        const userAccounts = await accountModel.find({ user: req.user.id });
        const accountIds = userAccounts.map(a => a._id);

        if (accountIds.length === 0) {
            return res.status(200).json({ message: 'No transactions found', transactions: [] });
        }

        const transactions = await transactionModel.find({
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const enriched = transactions.map(txn => {
            const isSender = accountIds.some(id => id.equals(txn.fromAccount));
            return {
                ...txn,
                direction: isSender ? 'SENT' : 'RECEIVED'
            };
        });

        return res.status(200).json({
            message: 'Transaction history fetched',
            transactions: enriched
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { createTransaction, createInitialFundTransaction, getTransactionHistory };