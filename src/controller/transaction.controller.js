const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");
const { sendTransactionEmail } = require("../services/email.service");
const mongoose = require('mongoose');
/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * * 1. Validate request
 * * 2. Validate idempotency key
 * * 3. Check account status
 * * 4. Derive sender balance from led
 * * 5. Create transaction (PENDING)
 * * 6. Create DEBIT ledger entry
 * * 7. Create CREDIT ledger entry
 * * 8. Mark transaction COMPLETED
 * * 9. Commit MongoDB session
 * * 10. Send email notification
 */
async function createTransaction(req, res) {
    try {
        /**
         * VALIDATON CHECKS 
         */
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body
        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            console.log('user given invalid input');

            return res.status(400).json({
                message: 'All fields are required fromAccount, toAccount,  amount, idempotencyKey'
            })

        }
        if (fromAccount === toAccount) {
            return res.status(400).json({
                message: 'fromAccount and toAccount cannot be same'
            })
        }
        const fromAccountDetails = await accountModel.findById(fromAccount)
        const toAccountDetails = await accountModel.findById(toAccount)

        if (!fromAccountDetails || !toAccountDetails) {
            return res.status(404).json({
                message: 'fromAccount or toAccount not found'
            })
        }

        /**
         * check idmpetency key with status
         */

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
                return res.status(response.code).json({
                    message: response.message,
                    status
                });
            }
        }

        /**
         * Check account status
         */
        if (fromAccountDetails.status !== "ACTIVE" || toAccountDetails.status !== "ACTIVE") {
            return res.status(500).json({
                message: 'invalid details'
            })
        }
        /**!SECTION
         * Derive sender balance from led
         */

        const balance = await fromAccountDetails.getBalance()
        if (balance < amount) {
            return res.status(400).json({
                message: `'insufficient balance' current balance is ${balance}`
            })
        }
        /**
         * SESSION PART PRIVIDE BY MONGODB
         */
        const session = await mongoose.startSession();
        session.startTransaction();

        const transaction = await transactionModel.create([{
            fromAccount, toAccount, amount, status: "PENDING", idempotencyKey
        }], { session })
        //NOTE - SESSION HAVE TO PROVIDE BECAUSE OF THE WE NEED MONGODB SESSION ABILITY TO DO THIS

        /**!SECTION
         * * 6. Create DEBIT ledger entry
         */
        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction[0]._id,
            type: "DEBIT"
        }], { session })

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            type: "CREDIT",
            amount: amount,
            transaction: transaction[0]._id

        }], { session })

        transaction[0].status = "COMPLETED"
        await transaction[0].save({ session })

        await session.commitTransaction();
        session.endSession();


        /**!SECTION
         * send email notification 
         */
        const transactionId = `TXN-${Date.now()}`
        await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
        return res.status(201).json({
            message: "transaction successfully completed",
            transaction: transaction[0]
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'internal server error '
        })

    }
}
async function createInitialFundTransaction(req, res) {
    try {
        const { toAccount, amount, idempotencyKey } = req.body
        if (!toAccount || !amount || !idempotencyKey) {
            console.log(toAccount, amount, idempotencyKey);

            return res.status(400).json({
                message: 'All fields are required formAccount, toAccount,  amount, idempotencyKey'
            })

        }
        const toAccountDetails = await accountModel.findOne({ user: toAccount })
        if (!toAccountDetails) {
            return res.status(404).json({
                message: ' toAccount not found'
            })
        }
        const fromUserAccount = await accountModel.findOne({
            user: req.user._id
        })
        if (!fromUserAccount) {
            return res.status(400).json({
                message: "system user account not found "
            })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount: toAccountDetails._id,
            amount: amount,
            idempotencyKey,
            status: "PENDING"
        })

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccountDetails._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction.status = "COMPLETED"
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction: transaction
        })
    } catch (err) {
        console.log(err);
        return res.status(404).json({
            message: "something went wrong "
        })

    }

}

module.exports = { createTransaction, createInitialFundTransaction }