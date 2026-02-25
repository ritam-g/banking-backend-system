const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        index: true,
        required: [true, 'fromAccount is required']
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        index: true,
        required: [true, 'toAccount is required']
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "CANCELED", "REVERSED", "REFUNDED"],
            message: "accountStatus must be either PENDING,COMPLETED,FAILED or CANCELED"
        },
        default: "PENDING"

    },
    amount: {
        type: Number,
        required: [true, 'amount is required for creating transaction'],
        min: [0.01, 'amount must be at least 0.01']
    },
    idempotencyKey: {
        type: String,
        required: [true, 'idempotencyKey is required for creating transaction'],
        unique: true,
        index: true
    }
}, { timestamps: true })


module.exports = mongoose.model("transaction", transactionSchema)