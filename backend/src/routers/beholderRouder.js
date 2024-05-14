const express = require('express');
const router = express.Router();
const beholderController = require('../controllers/beholderController.js');

router.get('/memory', beholderController.getMemory);

router.post('/brain', beholderController.getBrain);

module.exports = router;
