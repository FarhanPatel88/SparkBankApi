const express = require('express');
const router = express.Router();
const usersCtrl = require('../controllers/users');

router.get('/getUsers', usersCtrl.getUsers);
router.post('/addTransaction', usersCtrl.addTransaction);
router.get('/getTransactions', usersCtrl.getTransactions);
router.get('/getUser/:userId', usersCtrl.getUser);
router.post('/addDummyUsers', usersCtrl.addDummyUsers);

module.exports = router;
