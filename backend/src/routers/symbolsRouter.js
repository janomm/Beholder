const express = require('express');
const router = express.Router();
const symbolsController = require('../controllers/symbolsController.js');

router.get('/',symbolsController.getSymbols);

router.get('/:symbol',symbolsController.getSymbol);

router.patch('/:symbol',symbolsController.updateSymbol);

router.post('/sync',symbolsController.syncSymbol);


module.exports = router;