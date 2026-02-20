const accountModel = require("../models/account.model");

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
        const { formAccount, toAccount, amount, idempotencyKey } = req.body
        if (!formAccount || !toAccount || !amount || !idempotencyKey) {
            console.log('user given invalid input');

            return res.status(400).json({
                message: 'All fields are required formAccount, toAccount,  amount, idempotencyKey'
            })

        }
        if (formAccount === toAccount) {
            return res.status(400).json({
                message: 'fromAccount and toAccount cannot be same'
            })
        }
        const formAccountDetails = await accountModel.findById(formAccount)
        const toAccountDetails = await accountModel.findById(toAccount)

        if (!formAccountDetails || !toAccountDetails) {
            return res.status(404).json({
                message: 'fromAccount or toAccount not found'
            })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'internal server error '
        })

    }
}

module.exports={createTransaction}