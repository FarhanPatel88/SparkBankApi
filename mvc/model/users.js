const mongoose = require('mongoose');

const transactionsSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        // unique: true,
    },
    transactionDate: {
        type: Date,
        default: Date.now(),
    },
    transactionAmount: Number,
    transactionFrom: String,
    transactionTo: String,
});

const usersSchema = new mongoose.Schema({
    name: String,
    balance: Number,
    transactions: [transactionsSchema],
});

mongoose.model('Users', usersSchema);
mongoose.model('Transactions', transactionsSchema);
