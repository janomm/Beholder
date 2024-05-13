const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController.js');

router.get('/', settingsController.getSettings);

router.patch('/', settingsController.updateSettings);

module.exports = router;
