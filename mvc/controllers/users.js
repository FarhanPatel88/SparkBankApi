const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Transactions = mongoose.model('Transactions');

const getUsers = (req, res) => {
    Users.find((err, users) => {
        if (err) {
            return res.json({ error: err });
        }
        return res.json({ users });
    });
};

const getTransactions = (req, res) => {
    Transactions.find({}, '', { lean: true }, (err, transactions) => {
        if (err) {
            return res.json({ error: err });
        }
        const promise = new Promise((resolve, reject) => {
            let promises = [];
            transactions.forEach((transaction) => {
                promises.push(
                    new Promise((resolve, reject) => {
                        Users.findById(transaction.transactionFrom, (err, user) => {
                            if (err) {
                                return res.json({ error: err });
                            }
                            transaction.transactionFromUser = user.name;
                            Users.findById(transaction.transactionTo, (err, user) => {
                                if (err) {
                                    return res.json({ error: err });
                                }
                                transaction.transactionToUser = user.name;
                                transaction.transactionDate = transaction.transactionDate.toLocaleString();
                                resolve();
                            });
                        });
                    })
                );
            });
            Promise.all(promises).then(() => {
                resolve(transactions);
            });
        });
        promise.then(() => {
            return res.json({ transactions });
        });
    });
};

const addTransaction = ({ body }, res) => {
    let transaction = {
        transactionId: Date.now() + Math.floor(Math.random() * 10) + String.fromCharCode(Math.random() * (122 - 97) + 97),
        transactionDate: Date.now(),
        transactionAmount: body.amount,
        transactionFrom: body.from,
        transactionTo: body.to,
    };

    if (body.amount < 0) {
        return res.json({ error: 'Amount cannot be negative' });
    }

    Users.findById(body.from, (err, user) => {
        if (err) {
            return res.json({ error: err });
        }
        let message = null;
        if (user.balance != undefined) {
            if (user.balance != 0) {
                if (body.amount <= user.balance) {
                    user.balance = parseInt(user.balance) - parseInt(body.amount);
                } else {
                    message = "Amount exceeds the sender's balance";
                }
            } else {
                message = "Sender doesn't have enough balance";
            }
            if (message != null) {
                return res.json({ error: message });
            }
        } else {
            return res.json({ error: 'Something went wrong' });
        }
        return new Promise((resolve, reject) => {
            Transactions.create(transaction, (err, transaction) => {
                if (err) {
                    return res.json({ error: err });
                }
                user.transactions.push(transaction);
                user.save((err, user) => {
                    if (err) {
                        return res.json({ error: err });
                    }
                    resolve();
                });
            });
        })
            .then(() => {
                Users.findById(body.to, (err, userto) => {
                    if (err) {
                        return res.json({ error: err });
                    }
                    if (userto.balance != undefined) {
                        userto.balance = parseInt(body.amount) + parseInt(userto.balance);
                    } else {
                        return res.json({ error: 'Something went wrong' });
                    }
                    userto.transactions.push(transaction);
                    userto.save((err, userto) => {
                        if (err) {
                            return res.json({ error: err });
                        }
                        return res.json({ userFrom: user, userTo: userto });
                    });
                });
            })
            .catch((err) => {
                return res.json({ error: err });
            });
    });
};

const getUser = ({ params }, res) => {
    Users.findById(params.userId, (err, user) => {
        if (err) {
            return res.json({ error: err });
        }
        return res.json({ user });
    });
};

//Development purposes only
const addDummyUsers = ({ body }, res) => {
    console.log(body);

    Users.insertMany(body, (err, users) => {
        if (err) {
            return res.json({ error: err });
        }
        return res.json(users);
    });
};
module.exports = {
    getUsers,
    getTransactions,
    addTransaction,
    getUser,
    addDummyUsers,
};
