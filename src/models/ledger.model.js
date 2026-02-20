const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'account is required for creating ledger'],
        index: true,
        immutable: true

    },
    ammount: {
        type: Number,
        required: [true, 'ammount is required for creating ledger'],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction',
        required: [true, 'transaction is required for creating ledger'],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["DEBIT", "CREDIT"],
            message: "type must be either DEBIT or CREDIT"
        },
        required: [true, 'type is required for creating ledger'],
        immutable: true
    }
}, { timestamps: true })

function preventLedgerModification() {
    throw new Error('Ledger entries cannot be modified or deleted');
}

// Block updates
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

// Block deletes
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);


ledgerSchema.pre('remove',preventLedgerModification)
ledgerSchema.pre('updateOne',preventLedgerModification)
ledgerSchema.pre('replaceOne',preventLedgerModification)
ledgerSchema.pre('updateMany',preventLedgerModification)


module.exports = mongoose.model('ledger', ledgerSchema)